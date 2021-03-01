import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { combineLatest, Observable } from "rxjs";

import { IngredientModel } from "../../models/ingredient.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { IngredientPercentageModel } from "../../models/formula.model";
import { map } from "rxjs/operators";

@Injectable()
export class IngredientCRUDService {
  collection = COLLECTIONS.ingredients;

  constructor(private afs: AngularFirestore) {}

  /*
    Ingredient Collection
  */
  public getIngredientsDataSource(
    user_email: string
  ): Observable<Array<IngredientModel>> {
    let mine = this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.owner", "==", user_email)
      )
      .valueChanges({ idField: "id" });
    let shared = this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.shared_references", "array-contains", user_email)
      )
      .valueChanges({ idField: "id" });
    let publics = this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.public", "==", true)
      )
      .valueChanges({ idField: "id" });

      
    return combineLatest([mine,shared,publics]).pipe(
      map(([mine, shared, publics]) => {
        let aux1 = [...mine, ...shared, ...publics];
        let aux2 = [];
        aux1.forEach((item1) => {
          let exists = false;
          aux2.forEach((item2) => {
            if (item1.id == item2.id) {
              exists = true;
            }
          })
          if (!exists) {
            aux2.push(item1);
          }
        })
        return aux2;
      })
    )
  }

  public async getSubIngredients(ingredient: IngredientModel, collection = this.collection) {
    if (ingredient.formula && !ingredient.formula.ingredients) {
      ingredient.formula.ingredients = [];
      const docs = await this.afs.collection<IngredientModel>(`${collection}/${ingredient.id}/${this.collection}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let subIng: IngredientPercentageModel = doc.data() as IngredientPercentageModel;
          await this.getSubIngredients(subIng.ingredient, `${collection}/${ingredient.id}/${this.collection}`)
          ingredient.formula.ingredients.push(subIng)
        }
      })
      await Promise.all(promises)
    }
  }

  public async getIngredient(
    id: string
  ): Promise<IngredientModel> {
    let doc = await this.afs.collection<IngredientModel>(this.collection).doc(id).ref.get()
    if (doc.exists) {
      let ingredient = doc.data() as IngredientModel;
      await this.getSubIngredients(ingredient);
      return ingredient;
    }
    return new IngredientModel;
  }

  public getSharedIngredients(
    id: string
  ): Observable<Array<IngredientModel>> {
    return this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.reference", "==", id)
      )
      .valueChanges({ idField: "id" });
  }

  /*
    Ingredient Management
  */
  public async createIngredient(
    ingredientData: IngredientModel
  ): Promise<void> {
    let id = this.afs.createId();
    // Set ingredient
    ingredientData.id = id;
    let ingredient = JSON.parse(JSON.stringify(ingredientData));
    if (ingredientData.formula) {
      delete ingredient.formula.ingredients;
      if (ingredient.formula.mixing && ingredient.formula.mixing.length > 0) {
        ingredient.formula.mixing.forEach(step => {
          step.ingredients.forEach(ing => {
            if (ing.ingredient.formula) {
              delete ing.ingredient.formula.ingredients;
              delete ing.ingredient.formula.mixing;
            }
          })
        })
      }
    }
    await this.afs.collection(this.collection).doc(id).set(ingredient);
    // Set sub ingredients
    await this.createSubIngredient(this.collection, id, ingredientData);
  }

  public async createSubIngredient(collection: string, id: string, ingredientData: IngredientModel) {
    // Set sub ingredients
    if (ingredientData.formula) {
      let subingredients: IngredientPercentageModel[];
      subingredients = JSON.parse(JSON.stringify(ingredientData.formula.ingredients));
      const promises = subingredients.map(async ingredient => {
        let ing = JSON.parse(JSON.stringify(ingredient))
        if (ingredient.ingredient.formula) {
          delete ing.ingredient.formula.ingredients;
        }
        await this.afs.collection(collection).doc(id).collection(this.collection).doc(ingredient.ingredient.id).set(ing);
        let subcollection = `${collection}/${id}/${this.collection}`
        this.createSubIngredient(subcollection, ingredient.ingredient.id, ingredient.ingredient)
      })
      await Promise.all(promises)
    }
  }

  public async updateIngredient(ingredientData: IngredientModel): Promise<void> {
    let ingredient = JSON.parse(JSON.stringify(ingredientData));
    if (ingredientData.formula) {
      delete ingredient.formula.ingredients;
      if (ingredient.formula.mixing && ingredient.formula.mixing.length > 0) {
        ingredient.formula.mixing.forEach(step => {
          step.ingredients.forEach(ing => {
            if (ing.ingredient.formula && ing.ingredient.formula.ingredients) {
              delete ing.ingredient.formula.ingredients;
              delete ing.ingredient.formula.mixing;
            }
          })
        })
      }
    }
    // Delete sub ingredients
    await this.deleteSubIngredient(ingredientData);
    // Set sub ingredients
    await this.createSubIngredient(this.collection, ingredientData.id, ingredientData);
    await this.afs.collection(this.collection).doc(ingredientData.id).set(ingredient);
  }

  public async deleteIngredient(ingredient: IngredientModel): Promise<void> {
    await this.deleteSubIngredient(ingredient);
    return this.afs.collection(this.collection).doc(ingredient.id).delete();
  }

  public async deleteSubIngredient(ingredientData: IngredientModel, collection = this.collection) {
    if (ingredientData.formula && ingredientData.formula.ingredients) {
      const promises = ingredientData.formula.ingredients.map(async ingredient => {
        let subcollection = `${collection}/${ingredientData.id}/${this.collection}`
        await this.deleteSubIngredient(ingredient.ingredient, subcollection)
        await this.afs.collection(subcollection).doc(ingredient.ingredient.id).delete();
      })
      await Promise.all(promises)
    }
  }
}

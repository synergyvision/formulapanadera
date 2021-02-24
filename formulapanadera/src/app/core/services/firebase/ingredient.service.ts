import { Injectable } from "@angular/core";
import { AngularFirestore, AngularFirestoreDocument, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { IngredientModel } from "../../models/ingredient.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";
import { IngredientPercentageModel } from "../../models/formula.model";

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
    return this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.owner", "in", [user_email, ""])
      )
      .valueChanges({ idField: "id" });
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
    let ingredient = JSON.parse(JSON.stringify(ingredientData));
    ingredient.id = id;
    if (ingredientData.formula) {
      delete ingredient.formula.ingredients;
    }
    await this.afs.collection(this.collection).doc(id).set(ingredient);
    // Set sub ingredients
    await this.createSubIngredient(this.collection, id, ingredientData)
  }

  private async createSubIngredient(collection: string, id: string, ingredientData: IngredientModel) {
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

  public updateIngredient(ingredientData: IngredientModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(ingredientData.id)
      .set({ ...ingredientData });
  }

  public async deleteIngredient(ingredient: IngredientModel): Promise<void> {
    await this.deleteSubIngredient(ingredient);
    return this.afs.collection(this.collection).doc(ingredient.id).delete();
  }

  private async deleteSubIngredient(ingredientData: IngredientModel, collection = this.collection) {
    if (ingredientData.formula) {
      const promises = ingredientData.formula.ingredients.map(async ingredient => {
        let subcollection = `${collection}/${ingredientData.id}/${this.collection}`
        await this.deleteSubIngredient(ingredient.ingredient, subcollection)
        await this.afs.collection(subcollection).doc(ingredient.ingredient.id).delete();
      })
      await Promise.all(promises)
    }
  }
}

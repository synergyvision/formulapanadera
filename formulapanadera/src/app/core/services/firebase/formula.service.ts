import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { FormulaModel, IngredientPercentageModel } from "../../models/formula.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";
import { IngredientCRUDService } from "./ingredient.service";
import { IngredientModel } from "../../models/ingredient.model";

@Injectable()
export class FormulaCRUDService {
  collection = COLLECTIONS.formula;

  constructor(
    private afs: AngularFirestore,
    private ingredientCRUDService: IngredientCRUDService
  ) { }

  /*
    Formula Collection
  */
  public getFormulasDataSource(
    user_email: string
  ): Observable<Array<FormulaModel>> {
    return this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.owner", "in", [user_email, ""])
      )
      .valueChanges({ idField: "id" });
  }

  public async getIngredients(formula: FormulaModel, collection = this.collection) {
    if (!formula.ingredients || formula.ingredients.length == 0) {
      formula.ingredients = [];
      const docs = await this.afs.collection<IngredientPercentageModel>(`${collection}/${formula.id}/${COLLECTIONS.ingredients}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let subIng: IngredientPercentageModel = doc.data() as IngredientPercentageModel;
          await this.ingredientCRUDService.getSubIngredients(subIng.ingredient, `${collection}/${formula.id}/${COLLECTIONS.ingredients}`);
          formula.ingredients.push(subIng)
        }
      })
      await Promise.all(promises)
    }
  }

  public async getFormula(
    id: string
  ): Promise<FormulaModel> {
    let doc = await this.afs.collection<FormulaModel>(this.collection).doc(id).ref.get()
    if (doc.exists) {
      let formula = doc.data() as FormulaModel;
      await this.getIngredients(formula);
      return formula;
    }
    return new FormulaModel;
  }

  public getSharedFormulas(
    id: string
  ): Observable<Array<FormulaModel>> {
    return this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.reference", "==", id)
      )
      .valueChanges({ idField: "id" });
  }

  /*
    Formula Management
  */
  public async createFormula(formulaData: FormulaModel): Promise<void> {
    let id = this.afs.createId();
    formulaData.id = id;
    let formula: FormulaModel = JSON.parse(JSON.stringify(formulaData));
    delete formula.ingredients;
    if (formula.mixing && formula.mixing.length > 0) {
      formula.mixing.forEach(mix => {
        mix.mixing_order.forEach(step => {
          step.ingredients.forEach(ing => {
            if (ing.ingredient.formula) {
              delete ing.ingredient.formula.ingredients;
              delete ing.ingredient.formula.mixing;
            }
          })
        })
      })
    }
    await this.afs.collection(this.collection).doc(id).set(formula);
    // Set sub ingredients
    await this.createIngredients(`${this.collection}/${id}/${COLLECTIONS.ingredients}`, formulaData);
  }

  public async createIngredients(collection: string, formulaData: FormulaModel) {
    let ingredients: IngredientPercentageModel[] = JSON.parse(JSON.stringify(formulaData.ingredients));
    const promises = ingredients.map(async ingredient => {
      let ing: IngredientPercentageModel = JSON.parse(JSON.stringify(ingredient))
      if (ingredient.ingredient.formula) {
        delete ing.ingredient.formula.ingredients;
      }
      await this.afs.collection(collection).doc(ingredient.ingredient.id).set(ing);
      await this.ingredientCRUDService.createSubIngredient(collection, ingredient.ingredient.id, ingredient.ingredient);
    })
    await Promise.all(promises)
  }

  public async updateFormula(formulaData: FormulaModel): Promise<void> {
    let formula: FormulaModel = JSON.parse(JSON.stringify(formulaData));
    delete formula.ingredients;
    if (formula.mixing && formula.mixing.length > 0) {
      formula.mixing.forEach(mix => {
        mix.mixing_order.forEach((step=>{
          step.ingredients.forEach(ing => {
            if (ing.ingredient.formula && ing.ingredient.formula.ingredients) {
              delete ing.ingredient.formula.ingredients;
              delete ing.ingredient.formula.mixing;
            }
          })
        }))
      })
    }
    // Delete sub ingredients
    await this.deleteIngredients(formulaData);
    // Set sub ingredients
    await this.createIngredients(`${this.collection}/${formulaData.id}/${COLLECTIONS.ingredients}`, formulaData);
    await this.afs.collection(this.collection).doc(formulaData.id).set(formula);
  }

  public async deleteFormula(formulaData: FormulaModel): Promise<void> {
    await this.deleteIngredients(formulaData);
    return this.afs.collection(this.collection).doc(formulaData.id).delete();
  }

  public async deleteIngredients(formulaData: FormulaModel, collection = this.collection): Promise<void>{
    const promises = formulaData.ingredients.map(async ingredient => {
      let subcollection = `${collection}/${formulaData.id}/${COLLECTIONS.ingredients}`;
      await this.ingredientCRUDService.deleteSubIngredient(ingredient.ingredient, subcollection);
      await this.afs.collection(subcollection).doc(ingredient.ingredient.id).delete();
    })
    await Promise.all(promises)
  }
}

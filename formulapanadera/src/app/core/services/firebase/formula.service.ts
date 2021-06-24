import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { combineLatest, Observable } from "rxjs";

import { FormulaModel, IngredientPercentageModel } from "../../models/formula.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";
import { IngredientCRUDService } from "./ingredient.service";
import { NetworkService } from "../network.service";
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { OfflineManagerService } from "../offline-manager.service";
import { FirebaseService } from "../../interfaces/firebase-service.interface";
import { FormulaService } from "../formula.service";
import { IngredientModel } from "../../models/ingredient.model";
import { ShellModel } from "src/app/shared/shell/shell.model";

const API_STORAGE_KEY = environment.storage_key;

@Injectable()
export class FormulaCRUDService implements FirebaseService {
  collection = COLLECTIONS.formula;

  constructor(
    private afs: AngularFirestore,
    private formulaService: FormulaService,
    private ingredientCRUDService: IngredientCRUDService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private offlineManager: OfflineManagerService
  ) { }

  /*
    Formula Collection
  */
  public getFormulasDataSource(
    user_email: string
  ): Observable<Array<FormulaModel>> {
    let mine = this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.owner", "==", user_email)
      )
      .valueChanges({ idField: "id" });
    let shared = this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.shared_references", "array-contains", user_email)
      )
      .valueChanges({ idField: "id" });
    let publics = this.afs
      .collection<FormulaModel>(this.collection, (ref) =>
        ref.where("user.public", "==", true)
      )
      .valueChanges({ idField: "id" });

    
    return combineLatest([mine, shared, publics]).pipe(
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

  /*
    Formula Management
  */
  public async create(formulaData: FormulaModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
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
      // Set sub ingredients
      await this.createIngredients(`${this.collection}/${id}/${COLLECTIONS.ingredients}`, formulaData);
      await this.afs.collection(this.collection).doc(id).set(formula);
    } else {
      await this.offlineManager.storeRequest(this.collection, 'C', formulaData, null);
      await this.updateLocalData('C', formulaData);
    }
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

  public async update(formulaData: FormulaModel, originalFormula: FormulaModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      let formula: FormulaModel = JSON.parse(JSON.stringify(formulaData));
      delete formula.ingredients;
      formula.user.last_modified = new Date();
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
      await this.deleteIngredients(originalFormula);
      // Set sub ingredients
      await this.createIngredients(`${this.collection}/${formulaData.id}/${COLLECTIONS.ingredients}`, formulaData);
      await this.afs.collection(this.collection).doc(formulaData.id).set(formula);
    } else {
      await this.offlineManager.storeRequest(this.collection, 'U', formulaData, originalFormula);
      await this.updateLocalData('U', formulaData);
    }
  }

  public async delete(formulaData: FormulaModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      await this.deleteIngredients(formulaData);
      await this.afs.collection(this.collection).doc(formulaData.id).delete();
    } else {
      await this.offlineManager.storeRequest(this.collection, 'D', formulaData, null);
      await this.updateLocalData('D', formulaData);
    }
  }

  public async deleteIngredients(formulaData: FormulaModel, collection = this.collection): Promise<void>{
    const promises = formulaData.ingredients.map(async ingredient => {
      let subcollection = `${collection}/${formulaData.id}/${COLLECTIONS.ingredients}`;
      await this.ingredientCRUDService.deleteSubIngredient(ingredient.ingredient, subcollection);
      await this.afs.collection(subcollection).doc(ingredient.ingredient.id).delete();
    })
    await Promise.all(promises)
  }

  public async updateIngredients(updated_ingredients: IngredientModel[], updated_formulas: FormulaModel[]) {
    let formulas: FormulaModel[] = JSON.parse(JSON.stringify(this.formulaService.getCurrentFormulas()));
    const for_promises = formulas.map((formula) => {
      let original_formula: FormulaModel = JSON.parse(JSON.stringify(formula));
      let has_ingredient: boolean = this.formulaService.hasIngredient(formula, updated_ingredients);
      if (has_ingredient) {
        updated_formulas.push(formula)
        return this.update(formula, original_formula);
      }
    })
    await Promise.all(for_promises);
  }

  // Save result of API requests
  public setLocalData(data: any) {
    this.storageService.set(`${API_STORAGE_KEY}-${this.collection}`, data);
  }
 
  // Get cached API result
  public getLocalData() {
    return this.storageService.get(`${API_STORAGE_KEY}-${this.collection}`);
  }

  private async updateLocalData(operation: 'C' | 'U' | 'D', updatedData: FormulaModel) {
    let data: FormulaModel[] = await this.getLocalData();
    if (operation == 'C') {
      data.push(updatedData);
    } else {
      data.forEach((formula, index) => {
        if (formula.id == updatedData.id) {
          if (operation == 'U') {
            data[index] = JSON.parse(JSON.stringify(updatedData));
          }
          if (operation == 'D') {
            data.splice(index, 1)
          }
        }
      })
    }
    this.setLocalData(data);
    this.formulaService.setFormulas(data as FormulaModel[] & ShellModel)
  }
}

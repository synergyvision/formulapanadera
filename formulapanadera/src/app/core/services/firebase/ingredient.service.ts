import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { combineLatest, Observable } from "rxjs";

import { IngredientModel } from "../../models/ingredient.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { IngredientPercentageModel } from "../../models/formula.model";
import { map } from "rxjs/operators";
import { NetworkService } from "../network.service";
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { OfflineManagerService } from "../offline-manager.service";
import { FirebaseService } from "../../interfaces/firebase-service.interface";
import { IngredientService } from "../ingredient.service";
import { ShellModel } from "src/app/shared/shell/shell.model";

const API_STORAGE_KEY = environment.storage_key;

@Injectable()
export class IngredientCRUDService implements FirebaseService {
  collection = COLLECTIONS.ingredients;

  constructor(
    private afs: AngularFirestore,
    private ingredientService: IngredientService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private offlineManager: OfflineManagerService
  ) { }

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

  /*
    Ingredient Management
  */
  public async create(
    ingredientData: IngredientModel
  ): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
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
      // Set sub ingredients
      await this.createSubIngredient(this.collection, id, ingredientData);
      await this.afs.collection(this.collection).doc(id).set(ingredient);
    } else {
      await this.offlineManager.storeRequest(this.collection, 'C', ingredientData, null);
      await this.updateLocalData('C', ingredientData);
    }
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

  public async update(ingredientData: IngredientModel, originalIngredient: IngredientModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      let ingredient = JSON.parse(JSON.stringify(ingredientData));
      ingredient.user.last_modified = new Date();
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
      await this.deleteSubIngredient(originalIngredient);
      // Set sub ingredients
      await this.createSubIngredient(this.collection, ingredientData.id, ingredientData);
      await this.afs.collection(this.collection).doc(ingredientData.id).set(ingredient);
    } else {
      await this.offlineManager.storeRequest(this.collection, 'U', ingredientData, originalIngredient);
      await this.updateLocalData('U', ingredientData);
    }
  }

  public async delete(ingredientData: IngredientModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      await this.deleteSubIngredient(ingredientData);
      await this.afs.collection(this.collection).doc(ingredientData.id).delete();
    } else {
      await this.offlineManager.storeRequest(this.collection, 'D', ingredientData, null);
      await this.updateLocalData('D', ingredientData);
    }
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

  public async updateIngredients(updated_ingredient: IngredientModel, updated_ingredients: IngredientModel[]) {
    let ingredients: IngredientModel[] = JSON.parse(JSON.stringify(this.ingredientService.getCurrentIngredients()));
    const ing_promises = ingredients.map((ingredient) => {
      let original_ingredient: IngredientModel = JSON.parse(JSON.stringify(ingredient));
      let has_ingredient: boolean = this.ingredientService.hasIngredient(ingredient, updated_ingredient);
      if (has_ingredient) {
        updated_ingredients.push(ingredient);
        return this.update(ingredient, original_ingredient);
      }
    })
    await Promise.all(ing_promises);
  }

  // Save result of API requests
  public setLocalData(data: any) {
    this.storageService.set(`${API_STORAGE_KEY}-${this.collection}`, data);
  }
 
  // Get cached API result
  public getLocalData() {
    return this.storageService.get(`${API_STORAGE_KEY}-${this.collection}`);
  }

  private async updateLocalData(operation: 'C' | 'U' | 'D', updatedData: IngredientModel) {
    let data: IngredientModel[] = await this.getLocalData();
    if (operation == 'C') {
      data.push(updatedData);
    } else {
      data.forEach((ingredient, index) => {
        if (ingredient.id == updatedData.id) {
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
    this.ingredientService.setIngredients(data as IngredientModel[] & ShellModel)
  }
}

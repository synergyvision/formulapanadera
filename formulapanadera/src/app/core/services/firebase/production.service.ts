import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { combineLatest, from, Observable } from "rxjs";

import { FormulaNumberModel, ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";
import { FormulaCRUDService } from "./formula.service";
import { NetworkService } from "../network.service";
import { StorageService } from "../storage/storage.service";
import { environment } from "src/environments/environment";
import { OfflineManagerService } from "../offline-manager.service";
import { FirebaseService } from "../../interfaces/firebase-service.interface";

const API_STORAGE_KEY = environment.storage_key;

@Injectable()
export class ProductionCRUDService implements FirebaseService{
  collection = COLLECTIONS.production;

  constructor(
    private afs: AngularFirestore,
    private formulaCRUDService: FormulaCRUDService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private offlineManager: OfflineManagerService
  ) { }

  /*
    Production Collection
  */
  public getProductionsDataSource(
    user_email: string
  ): Observable<Array<ProductionModel>> {
    let mine = this.afs
      .collection<ProductionModel>(this.collection, (ref) =>
        ref.where("user.owner", "==", user_email)
      )
      .valueChanges({ idField: "id" });
    let shared = this.afs
      .collection<ProductionModel>(this.collection, (ref) =>
        ref.where("user.shared_references", "array-contains", user_email)
      )
      .valueChanges({ idField: "id" });
    let publics = this.afs
      .collection<ProductionModel>(this.collection, (ref) =>
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

  public async getFormulas(production: ProductionModel, collection = this.collection) {
    if (!production.formulas || production.formulas.length == 0) {
      production.formulas = [];
      const docs = await this.afs.collection<FormulaNumberModel>(`${collection}/${production.id}/${COLLECTIONS.formula}`).ref.get();
      const promises = docs.docs.map(async doc => {
        if (doc.exists) {
          let formula: FormulaNumberModel = doc.data() as FormulaNumberModel;
          await this.formulaCRUDService.getIngredients(formula.formula, `${collection}/${production.id}/${COLLECTIONS.formula}`);
          production.formulas.push(formula)
        }
      })
      await Promise.all(promises)
    }
  }

  /*
    Production Management
  */
  public async create(
    productionData: ProductionModel
  ): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      let id = this.afs.createId();
      productionData.id = id;
      let production: ProductionModel = JSON.parse(JSON.stringify(productionData));
      delete production.formulas;
      // Set formulas
      await this.createFormulas(`${this.collection}/${id}/${COLLECTIONS.formula}`, productionData);
      await this.afs.collection(this.collection).doc(id).set(production);
    } else {
      this.offlineManager.storeRequest(this.collection, 'C', productionData, null);
    }
  }

  public async createFormulas(collection: string, productionData: ProductionModel) {
    let formulas: FormulaNumberModel[] = JSON.parse(JSON.stringify(productionData.formulas));
    const promises = formulas.map(async formula => {
      let form: FormulaNumberModel = JSON.parse(JSON.stringify(formula));
      delete form.formula.ingredients;
      if (form.formula.mixing && form.formula.mixing.length > 0) {
        form.formula.mixing.forEach(mix => {
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
      await this.afs.collection(collection).doc(formula.formula.id).set(form);
      await this.formulaCRUDService.createIngredients(`${collection}/${formula.formula.id}/${COLLECTIONS.ingredients}`, formula.formula);
    })
    await Promise.all(promises)
  }

  public async update(productionData: ProductionModel, originalProduction: ProductionModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      let production: ProductionModel = JSON.parse(JSON.stringify(productionData));
      delete production.formulas;
      production.user.last_modified = new Date();
      // Delete formulas
      await this.deleteFormulas(originalProduction);
      // Set formulas
      await this.createFormulas(`${this.collection}/${productionData.id}/${COLLECTIONS.formula}`, productionData);
      await this.afs.collection(this.collection).doc(productionData.id).set(production);
    } else {
      this.offlineManager.storeRequest(this.collection, 'U', productionData, originalProduction);
    }
  }

  public async delete(productionData: ProductionModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      await this.deleteFormulas(productionData);
      return this.afs.collection(this.collection).doc(productionData.id).delete();
    } else {
      this.offlineManager.storeRequest(this.collection, 'D', productionData, null);
    }
  }

  public async deleteFormulas(productionData: ProductionModel, collection = this.collection): Promise<void>{
    const promises = productionData.formulas.map(async formula => {
      let subcollection = `${collection}/${productionData.id}/${COLLECTIONS.formula}`;
      await this.formulaCRUDService.deleteIngredients(formula.formula, subcollection);
      await this.afs.collection(subcollection).doc(formula.formula.id).delete();
    })
    await Promise.all(promises)
  }

  // Save result of API requests
  public setLocalData(data: any) {
    this.storageService.set(`${API_STORAGE_KEY}-${this.collection}`, data);
  }
 
  // Get cached API result
  public getLocalData() {
    return this.storageService.get(`${API_STORAGE_KEY}-${this.collection}`);
  }
}

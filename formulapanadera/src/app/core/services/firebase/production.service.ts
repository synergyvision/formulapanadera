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
import { ProductionService } from "../production.service";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaModel } from "../../models/formula.model";
import { UserStorageService } from "../storage/user.service";

const API_STORAGE_KEY = environment.storage_key;

@Injectable()
export class ProductionCRUDService implements FirebaseService{
  collection = COLLECTIONS.production;

  constructor(
    private afs: AngularFirestore,
    private productionService: ProductionService,
    private formulaCRUDService: FormulaCRUDService,
    private networkService: NetworkService,
    private storageService: StorageService,
    private offlineManager: OfflineManagerService,
    private userStorageService: UserStorageService
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
      
      let user = await this.userStorageService.getUser();
      if (user.role == 'FREE') {
        await this.updateLocalData('C', productionData);
      }
    } else {
      await this.offlineManager.storeRequest(this.collection, 'C', productionData, null);
      await this.updateLocalData('C', productionData);
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
      
      let user = await this.userStorageService.getUser();
      if (user.role == 'FREE') {
        await this.updateLocalData('U', productionData);
      }
    } else {
      await this.offlineManager.storeRequest(this.collection, 'U', productionData, originalProduction);
      await this.updateLocalData('U', productionData);
    }
  }

  public async delete(productionData: ProductionModel): Promise<void> {
    if (this.networkService.isConnectedToNetwork()) {
      await this.deleteFormulas(productionData);
      await this.afs.collection(this.collection).doc(productionData.id).delete();

      let user = await this.userStorageService.getUser();
      if (user.role == 'FREE') {
        await this.updateLocalData('D', productionData);
      }
    } else {
      await this.offlineManager.storeRequest(this.collection, 'D', productionData, null);
      await this.updateLocalData('D', productionData);
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

  public async updateFormulas(updated_formulas: FormulaModel[], updated_productions: ProductionModel[]) {
    let productions: ProductionModel[] = JSON.parse(JSON.stringify(this.productionService.getCurrentProductions()));
    const prod_promises = productions.map((production) => {
      let original_production: ProductionModel = JSON.parse(JSON.stringify(production));
      let has_formula: boolean = this.productionService.hasFormula(production, updated_formulas);
      if (has_formula) {
        updated_productions.push(production)
        return this.update(production, original_production);
      }
    })
    await Promise.all(prod_promises);
  }

  // Save result of API requests
  public setLocalData(data: any) {
    this.storageService.set(`${API_STORAGE_KEY}-${this.collection}`, data);
  }
 
  // Get cached API result
  public getLocalData() {
    return this.storageService.get(`${API_STORAGE_KEY}-${this.collection}`);
  }

  private async updateLocalData(operation: 'C' | 'U' | 'D', updatedData: ProductionModel) {
    let data: ProductionModel[] = await this.getLocalData();
    if (operation == 'C') {
      data.push(updatedData);
    } else {
      data.forEach((production, index) => {
        if (production.id == updatedData.id) {
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
    this.productionService.setProductions(data as ProductionModel[] & ShellModel)
  }
}

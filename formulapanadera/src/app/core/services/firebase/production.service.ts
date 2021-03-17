import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { combineLatest, Observable } from "rxjs";

import { FormulaNumberModel, ProductionModel } from "../../models/production.model";
import { COLLECTIONS } from "src/app/config/firebase";
import { map } from "rxjs/operators";
import { FormulaCRUDService } from "./formula.service";

@Injectable()
export class ProductionCRUDService {
  collection = COLLECTIONS.production;

  constructor(
    private afs: AngularFirestore,
    private formulaCRUDService: FormulaCRUDService
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

  public async getProduction(
    id: string
  ): Promise<ProductionModel> {
    let doc = await this.afs.collection<ProductionModel>(this.collection).doc(id).ref.get()
    if (doc.exists) {
      let production = doc.data() as ProductionModel;
      await this.getFormulas(production);
      return production;
    }
    return new ProductionModel;
  }

  /*
    Production Management
  */
  public async createProduction(
    productionData: ProductionModel
  ): Promise<void> {
    let id = this.afs.createId();
    productionData.id = id;
    let production: ProductionModel = JSON.parse(JSON.stringify(productionData));
    delete production.formulas;
    // Set formulas
    await this.createFormulas(`${this.collection}/${id}/${COLLECTIONS.formula}`, productionData);
    await this.afs.collection(this.collection).doc(id).set(production);
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

  public async updateProduction(productionData: ProductionModel, originalProduction: ProductionModel): Promise<void> {
    let production: ProductionModel = JSON.parse(JSON.stringify(productionData));
    delete production.formulas;
    // Delete formulas
    await this.deleteFormulas(originalProduction);
    // Set formulas
    await this.createFormulas(`${this.collection}/${productionData.id}/${COLLECTIONS.formula}`, productionData);
    await this.afs.collection(this.collection).doc(productionData.id).set(production);
  }

  public async deleteProduction(productionData: ProductionModel): Promise<void> {
    await this.deleteFormulas(productionData);
    return this.afs.collection(this.collection).doc(productionData.id).delete();
  }

  public async deleteFormulas(productionData: ProductionModel, collection = this.collection): Promise<void>{
    const promises = productionData.formulas.map(async formula => {
      let subcollection = `${collection}/${productionData.id}/${COLLECTIONS.formula}`;
      await this.formulaCRUDService.deleteIngredients(formula.formula, subcollection);
      await this.afs.collection(subcollection).doc(formula.formula.id).delete();
    })
    await Promise.all(promises)
  }
}

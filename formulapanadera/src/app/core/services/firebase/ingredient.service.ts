import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";

import { IngredientModel } from "../../models/ingredient.model";
import { Observable } from "rxjs";
import { COLLECTIONS } from "src/app/config/firebase.constants";

@Injectable()
export class IngredientCRUDService {
  collection = COLLECTIONS.ingredients;

  constructor(private afs: AngularFirestore) {}

  /*
    Ingredient Collection
  */
  public getIngredientsDataSource(): Observable<Array<IngredientModel>> {
    return this.afs
      .collection<IngredientModel>(this.collection)
      .valueChanges({ idField: "id" });
  }

  /*
    Ingredient Management
  */
  public createIngredient(
    ingredientData: IngredientModel
  ): Promise<DocumentReference> {
    return this.afs.collection(this.collection).add({ ...ingredientData });
  }

  public updateIngredient(ingredientData: IngredientModel): Promise<void> {
    return this.afs
      .collection(this.collection)
      .doc(ingredientData.id)
      .set({ ...ingredientData });
  }

  public deleteIngredient(ingredientKey: string): Promise<void> {
    return this.afs.collection(this.collection).doc(ingredientKey).delete();
  }
}

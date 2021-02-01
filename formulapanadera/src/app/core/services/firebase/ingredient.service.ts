import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";

import { IngredientModel } from "../../models/ingredient.model";
import { COLLECTIONS } from "src/app/config/firebase";
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
    return this.afs
      .collection<IngredientModel>(this.collection, (ref) =>
        ref.where("user.owner", "in", [user_email, ""])
      )
      .valueChanges({ idField: "id" });
  }

  public getIngredient(
    id: string
  ): Observable<IngredientModel> {
    return this.afs.collection<IngredientModel>(this.collection).doc(id).snapshotChanges()
    .pipe(
      map( a => {
        const data = a.payload.data();
        return data as IngredientModel;
      })
    );
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

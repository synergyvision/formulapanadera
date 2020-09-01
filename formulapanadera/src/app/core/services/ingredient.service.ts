import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";

import { DataStore } from "src/app/shared/shell/data-store";
import { IngredientModel } from "../models/ingredient.model";
import { Observable, of } from "rxjs";

@Injectable()
export class IngredientService {
  private ingredientsDataStore: DataStore<Array<IngredientModel>>;
  constructor(private afs: AngularFirestore) {}

  /*
    Ingredient Listing Page
  */
  public getIngredientsDataSource(): Observable<Array<IngredientModel>> {
    return this.afs
      .collection<IngredientModel>("ingredients")
      .valueChanges({ idField: "id" });
  }

  public getIngredientsStore(
    dataSource: Observable<Array<IngredientModel>>
  ): DataStore<Array<IngredientModel>> {
    // Use cache if available
    if (!this.ingredientsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<IngredientModel> = [
        new IngredientModel(),
        new IngredientModel(),
        new IngredientModel(),
        new IngredientModel(),
        new IngredientModel(),
        new IngredientModel(),
      ];

      this.ingredientsDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.ingredientsDataStore.load(dataSource);
    }
    return this.ingredientsDataStore;
  }

  //Filters
  public searchIngredientsByHydration(
    lower: number,
    upper: number
  ): Observable<Array<IngredientModel>> {
    const filtered = [];
    this.ingredientsDataStore.state.forEach((ingredient) => {
      ingredient.forEach((item) => {
        if (item.hydration >= lower && item.hydration <= upper) {
          filtered.push(item);
        }
      });
    });
    return of(filtered);
  }

  public searchIngredientsByCost(
    lower: number,
    upper: number,
    ingredients: Observable<Array<IngredientModel>>
  ): Observable<Array<IngredientModel>> {
    const filtered = [];
    ingredients.forEach((ingredient) => {
      ingredient.forEach((item) => {
        if (
          (item.cost >= lower || lower == null) &&
          (item.cost <= upper || upper == null)
        ) {
          filtered.push(item);
        }
      });
    });
    return of(filtered);
  }

  /*
    Ingredient Management Modal
  */
  public createIngredient(
    ingredientData: IngredientModel
  ): Promise<DocumentReference> {
    return this.afs.collection("ingredients").add({ ...ingredientData });
  }

  public updateIngredient(ingredientData: IngredientModel): Promise<void> {
    return this.afs
      .collection("ingredients")
      .doc(ingredientData.id)
      .set({ ...ingredientData });
  }

  public deleteIngredient(ingredientKey: string): Promise<void> {
    return this.afs.collection("ingredients").doc(ingredientKey).delete();
  }
}

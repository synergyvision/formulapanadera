import { Injectable } from "@angular/core";
import { DataStore } from "src/app/shared/shell/data-store";
import { IngredientModel } from "../models/ingredient.model";
import { Observable, of } from "rxjs";
import { LOADING_ITEMS } from "src/app/config/loading";

@Injectable()
export class IngredientService {
  private ingredientsDataStore: DataStore<Array<IngredientModel>>;

  constructor() {}

  /*
    Ingredient Listing
  */
  public getIngredientsStore(
    dataSource: Observable<Array<IngredientModel>>
  ): DataStore<Array<IngredientModel>> {
    // Use cache if available
    if (!this.ingredientsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: Array<IngredientModel> = [];
      for (let index = 0; index < LOADING_ITEMS; index++) {
        shellModel.push(new IngredientModel());
      }

      this.ingredientsDataStore = new DataStore(shellModel);
      // Trigger the loading mechanism (with shell) in the dataStore
      this.ingredientsDataStore.load(dataSource);
    }
    return this.ingredientsDataStore;
  }

  /*
    Filters
  */
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

  public searchIngredientsByType(
    type: string,
    ingredients: Observable<Array<IngredientModel>>
  ): Observable<Array<IngredientModel>> {
    const filtered = [];
    let isFlour = type == "flour";
    ingredients.forEach((ingredient) => {
      ingredient.forEach((item) => {
        if (item.is_flour == isFlour) {
          filtered.push(item);
        }
      });
    });

    return of(filtered);
  }

  public searchIngredientsByFormula(
    type: string,
    ingredients: Observable<Array<IngredientModel>>
  ): Observable<Array<IngredientModel>> {
    const filtered = [];
    let simple = type == "simple";
    ingredients.forEach((ingredient) => {
      ingredient.forEach((item) => {
        if ((item.formula && !simple) || (!item.formula && simple)) {
          filtered.push(item);
        }
      });
    });

    return of(filtered);
  }
}

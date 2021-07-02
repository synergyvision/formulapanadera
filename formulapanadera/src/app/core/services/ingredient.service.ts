import { Injectable } from "@angular/core";
import { IngredientListingModel, IngredientModel } from "../models/ingredient.model";

import { ShellModel } from "src/app/shared/shell/shell.model";
import { BehaviorSubject, Observable } from "rxjs";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { IngredientPercentageModel } from "../models/formula.model";
import { DECIMALS } from "src/app/config/formats";

@Injectable()
export class IngredientService {
  private ingredients_listing: BehaviorSubject<IngredientListingModel[]> = new BehaviorSubject<IngredientListingModel[]>(undefined);

  constructor() {}

  public setIngredientsListing(ingredients: IngredientListingModel[] & ShellModel) {
    this.ingredients_listing.next(ingredients);
  }

  public getIngredientsListing(): Observable<IngredientListingModel[]> {
    return this.ingredients_listing.asObservable();
  }

  public clearIngredients() {
    this.ingredients_listing = new BehaviorSubject<IngredientListingModel[]>(undefined);
  }

  public searchingState() {
    let searchingShellModel: IngredientModel[] &
      ShellModel = [] as IngredientModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new IngredientModel());
    }
    searchingShellModel.isShell = true;
    return searchingShellModel;
  }

  public calculateHydration(
    ingredients: Array<IngredientPercentageModel>
  ): string {
    let hydration: number = 0;
    ingredients.forEach((ingredientData) => {
      if (!ingredientData.ingredient.formula) {
        hydration =
          ingredientData.percentage * ingredientData.ingredient.hydration +
          hydration;
      }
    });
    return (hydration / 100).toFixed(DECIMALS.hydration);
  }

  public calculateFat(
    ingredients: Array<IngredientPercentageModel>
  ): string {
    let fat: number = 0;
    ingredients.forEach((ingredientData) => {
      if (!ingredientData.ingredient.formula) {
        fat =
          ingredientData.percentage * ingredientData.ingredient.fat +
          fat;
      }
    });
    return (fat / 100).toFixed(DECIMALS.fat);
  }

  /*
    Filters
  */
  public searchIngredientsByHydration(
    lower: number,
    upper: number,
    ingredients: IngredientListingModel[] & ShellModel
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if (item.hydration >= lower && item.hydration <= upper) {
        filtered.push(item);
      }
    });
    return filtered as IngredientListingModel[] & ShellModel;
  }

  public searchIngredientsByFat(
    lower: number,
    upper: number,
    ingredients: IngredientListingModel[] & ShellModel
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if ((!item.fat && lower == 0) || (item.fat >= lower && item.fat <= upper)) {
        filtered.push(item);
      }
    });
    return filtered as IngredientListingModel[] & ShellModel;
  }

  public searchIngredientsByCost(
    lower: number,
    upper: number,
    ingredients: IngredientListingModel[] & ShellModel
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if (
        (item.cost >= lower || lower == null) &&
        (item.cost <= upper || upper == null)
      ) {
        filtered.push(item);
      }
    });
    return filtered as IngredientListingModel[] & ShellModel;
  }

  public searchIngredientsByType(
    type: string,
    ingredients: IngredientListingModel[] & ShellModel
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    let isFlour = type == "flour";
    ingredients.forEach((item) => {
      if (item.is_flour == isFlour) {
        filtered.push(item);
      }
    });

    return filtered as IngredientListingModel[] & ShellModel;
  }

  public searchIngredientsByFormula(
    type: string,
    ingredients: IngredientListingModel[] & ShellModel
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    let simple = type == "simple";
    ingredients.forEach((item) => {
      if ((item.formula && !simple) || (!item.formula && simple)) {
        filtered.push(item);
      }
    });

    return filtered as IngredientListingModel[] & ShellModel;
  }

  public searchIngredientsByShared(
    type: string,
    ingredients: IngredientListingModel[] & ShellModel,
    user_email: string
  ): IngredientListingModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if (
        (type == "mine" &&
          (item.user.owner == user_email)) ||
        (type == "shared" &&
          !(item.user.owner == user_email) &&
          !item.user.public) ||
        (type == "public" &&
          !(item.user.owner == user_email) &&
          item.user.public)
      ) {
        filtered.push(item);
      }
    });
    return filtered as IngredientListingModel[] & ShellModel;
  }

  /*
  Update
  */
  
  public hasIngredient(ingredient: IngredientModel, new_ingredient: IngredientModel): boolean {
    let has_ingredient: boolean = false;
    if (ingredient.formula) {
      ingredient.formula.ingredients.forEach(ingredient => {
        if (ingredient.ingredient.id == new_ingredient.id) {
          has_ingredient = true;
          ingredient.ingredient = new_ingredient;
        }
      });
      if (has_ingredient) {
        ingredient.formula.mixing?.forEach(step => {
          step.ingredients.forEach(ingredient => {
            if (ingredient.ingredient.id == new_ingredient.id) {
              ingredient.ingredient = new_ingredient;
            }
          })
        })
      }
    }
    return has_ingredient;
  }

  // Sort
  sortIngredients(ingredients) {
    return ingredients.sort(function (a, b) {
      if (a.name && b.name) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        if (b.name.toUpperCase() > a.name.toUpperCase()) {
          return -1;
        }
      }
      return 0;
    })
  }
}

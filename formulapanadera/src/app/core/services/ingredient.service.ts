import { Injectable } from "@angular/core";
import { IngredientModel } from "../models/ingredient.model";

import { ShellModel } from "src/app/shared/shell/shell.model";
import { BehaviorSubject, Observable } from "rxjs";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { IngredientPercentageModel } from "../models/formula.model";
import { DECIMALS } from "src/app/config/formats";

@Injectable()
export class IngredientService {
  private ingredients: BehaviorSubject<IngredientModel[]> = new BehaviorSubject<IngredientModel[]>(undefined);

  constructor() {}

  public setIngredients(ingredients: IngredientModel[] & ShellModel) {
    this.ingredients.next(ingredients);
  }

  public getIngredients(): Observable<IngredientModel[]> {
    return this.ingredients.asObservable();
  }

  public getCurrentIngredients(): IngredientModel[] {
    return this.ingredients.getValue();
  }

  public clearIngredients() {
    this.ingredients = new BehaviorSubject<IngredientModel[]>(undefined);
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
    ingredients: IngredientModel[] & ShellModel
  ): IngredientModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if (item.hydration >= lower && item.hydration <= upper) {
        filtered.push(item);
      }
    });
    return filtered as IngredientModel[] & ShellModel;
  }

  public searchIngredientsByFat(
    lower: number,
    upper: number,
    ingredients: IngredientModel[] & ShellModel
  ): IngredientModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if ((!item.fat && lower == 0) || (item.fat >= lower && item.fat <= upper)) {
        filtered.push(item);
      }
    });
    return filtered as IngredientModel[] & ShellModel;
  }

  public searchIngredientsByCost(
    lower: number,
    upper: number,
    ingredients: IngredientModel[] & ShellModel
  ): IngredientModel[] & ShellModel {
    const filtered = [];
    ingredients.forEach((item) => {
      if (
        (item.cost >= lower || lower == null) &&
        (item.cost <= upper || upper == null)
      ) {
        filtered.push(item);
      }
    });
    return filtered as IngredientModel[] & ShellModel;
  }

  public searchIngredientsByType(
    type: string,
    ingredients: IngredientModel[] & ShellModel
  ): IngredientModel[] & ShellModel {
    const filtered = [];
    let isFlour = type == "flour";
    ingredients.forEach((item) => {
      if (item.is_flour == isFlour) {
        filtered.push(item);
      }
    });

    return filtered as IngredientModel[] & ShellModel;
  }

  public searchIngredientsByFormula(
    type: string,
    ingredients: IngredientModel[] & ShellModel
  ): IngredientModel[] & ShellModel {
    const filtered = [];
    let simple = type == "simple";
    ingredients.forEach((item) => {
      if ((item.formula && !simple) || (!item.formula && simple)) {
        filtered.push(item);
      }
    });

    return filtered as IngredientModel[] & ShellModel;
  }

  public searchIngredientsByShared(
    type: string,
    ingredients: IngredientModel[] & ShellModel,
    user_email: string
  ): IngredientModel[] & ShellModel {
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
    return filtered as IngredientModel[] & ShellModel;
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
  sortIngredients(ingredients: IngredientModel[]): IngredientModel[] & ShellModel {
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
    }) as IngredientModel[] & ShellModel
  }
}

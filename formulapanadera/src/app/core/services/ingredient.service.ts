import { Injectable } from "@angular/core";
import { IngredientModel } from "../models/ingredient.model";

import { ShellModel } from "src/app/shared/shell/shell.model";

@Injectable()
export class IngredientService {
  private ingredients: IngredientModel[] & ShellModel;

  constructor() {}

  public setIngredients(ingredients: IngredientModel[] & ShellModel) {
    this.ingredients = ingredients;
  }

  public getIngredients() {
    return this.ingredients;
  }

  public clearIngredients() {
    this.ingredients = null;
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

import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

import { DataStore } from "src/app/shared/shell/data-store";
import { IngredientModel } from "../models/ingredient.model";

import { LOADING_ITEMS } from "src/app/config/configuration";
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
}

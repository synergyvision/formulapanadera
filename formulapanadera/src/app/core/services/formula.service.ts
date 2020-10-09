import { Injectable } from "@angular/core";
import {
  FormulaModel,
  IngredientPercentageModel,
  StepDetailsModel,
} from "../models/formula.model";

import { DECIMALS } from "src/app/config/formats";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { OVEN_STEP } from "src/app/config/formula";

@Injectable()
export class FormulaService {
  private formulas: FormulaModel[] & ShellModel;

  constructor() {}

  public setFormulas(formulas: FormulaModel[] & ShellModel) {
    this.formulas = formulas;
  }

  public getFormulas() {
    return this.formulas;
  }

  public clearFormulas() {
    this.formulas = null;
  }

  /*
    Filters
  */
  public searchFormulasByHydration(
    lower: number,
    upper: number,
    formulas: FormulaModel[] & ShellModel
  ): FormulaModel[] & ShellModel {
    const filtered = [];
    let hydration: number;
    formulas.forEach((item) => {
      hydration = Number(this.calculateHydration(item.ingredients));
      if (hydration >= lower && hydration <= upper) {
        filtered.push(item);
      }
    });
    return filtered as FormulaModel[] & ShellModel;
  }

  public searchFormulasByCost(
    lower: number,
    upper: number,
    formulas: FormulaModel[] & ShellModel
  ): FormulaModel[] & ShellModel {
    const filtered = [];
    let bakers_percentage: number;
    let cost: number;
    formulas.forEach((item) => {
      bakers_percentage = Number(
        this.calculateBakersPercentage(
          item.units * item.unit_weight,
          item.ingredients
        )
      );
      cost =
        Number(this.calculateTotalCost(item.ingredients, bakers_percentage)) /
        item.units;
      if (
        (cost >= lower || lower == null) &&
        (cost <= upper || upper == null)
      ) {
        filtered.push(item);
      }
    });
    return filtered as FormulaModel[] & ShellModel;
  }

  public searchFormulasByShared(
    type: string,
    formulas: FormulaModel[] & ShellModel,
    user_email: string
  ): FormulaModel[] & ShellModel {
    const filtered = [];
    formulas.forEach((item) => {
      if (
        (type == "mine" &&
          (item.user.creator.email == user_email || // creator or
            item.user.cloned)) || // owner that cloned the formula
        (type == "shared" &&
          item.user.owner == user_email &&
          !item.user.cloned) ||
        (type == "public" &&
          item.user.creator.email !== user_email && // public formulas, current user is not the creator
          !item.user.owner)
      ) {
        filtered.push(item);
      }
    });
    return filtered as FormulaModel[] & ShellModel;
  }

  /*
  Formula calculations
  */
  public calculateBakersPercentage(
    total_weight: number,
    ingredients: Array<IngredientPercentageModel>,
    all = false
  ): string {
    let percentage: number = 0;
    ingredients.forEach((ingredientData) => {
      if (!ingredientData.ingredient.formula || all) {
        percentage = percentage + Number(ingredientData.percentage);
      }
    });
    return (total_weight / percentage).toFixed(DECIMALS.bakers_percentage);
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

  public calculateTotalCost(
    ingredients: Array<IngredientPercentageModel>,
    bakers_percentage: number
  ): string {
    let cost: number = 0;
    ingredients.forEach((ingredientData) => {
      if (!ingredientData.ingredient.formula) {
        cost =
          ingredientData.percentage *
            bakers_percentage *
            ingredientData.ingredient.cost +
          cost;
      }
    });
    return cost.toFixed(DECIMALS.cost);
  }

  public fromRecipeToFormula(ingredients: Array<IngredientPercentageModel>) {
    let bakers_percentage = this.totalFlour(ingredients) / 100;
    ingredients.forEach((ingredient) => {
      if (!ingredient.ingredient.formula) {
        ingredient.percentage = Number(
          (ingredient.percentage / Number(bakers_percentage)).toFixed(
            DECIMALS.formula_percentage
          )
        );
      }
    });
    return ingredients;
  }

  public totalFlour(ingredients: Array<IngredientPercentageModel>) {
    let flour = 0;
    ingredients.forEach((ingredient) => {
      if (ingredient.ingredient.is_flour) {
        flour = flour + ingredient.percentage;
      }
    });
    return flour;
  }

  public getIngredientsWithFormula(
    ingredients: Array<IngredientPercentageModel>,
    ingredients_formula: Array<IngredientPercentageModel>
  ) {
    ingredients.forEach((item) => {
      if (item.ingredient.formula) {
        ingredients_formula.push(JSON.parse(JSON.stringify(item)));
      }
    });
  }

  public getProportionFactor(
    weight: number,
    bakers_percentage: number,
    item: IngredientPercentageModel,
    ingredients: Array<IngredientPercentageModel>
  ): number {
    if (item.ingredient.formula.proportion_factor.factor == "dough") {
      return (item.percentage / 100) * Number(weight);
    } else if (item.ingredient.formula.proportion_factor.factor == "flour") {
      return (item.percentage / 100) * Number(bakers_percentage) * 100;
    } else if (
      item.ingredient.formula.proportion_factor.factor == "ingredient"
    ) {
      let ingredientWeight: number;
      ingredients.forEach((ingredient) => {
        if (
          ingredient.ingredient.id ==
          item.ingredient.formula.proportion_factor.ingredient.id
        ) {
          ingredientWeight = ingredient.percentage * Number(bakers_percentage);
        }
      });
      return (item.percentage / 100) * ingredientWeight;
    }
  }

  public getIngredientsCalculatedPercentages(
    formula_weight: number,
    original_bakers_percentage: number,
    ingredients: Array<IngredientPercentageModel>,
    ingredients_formula: Array<any>,
    all_ingredients_formula: Array<any>
  ) {
    let bakers_percentage: string;
    let proportion_factor: number;
    ingredients_formula.forEach((item) => {
      // Get bakers percentage from certain factor
      if (!item.prop_factor) {
        proportion_factor = this.getProportionFactor(
          formula_weight,
          original_bakers_percentage,
          item,
          ingredients
        );
      } else {
        proportion_factor = item.prop_factor;
      }
      bakers_percentage = this.calculateBakersPercentage(
        proportion_factor,
        item.ingredient.formula.ingredients,
        true
      );
      item.bakers_percentage = bakers_percentage;

      all_ingredients_formula.push(item);

      let sub_ingredients_formula = [];
      item.ingredient.formula.ingredients.forEach((element) => {
        if (element.ingredient.formula) {
          element.prop_factor = element.percentage * Number(bakers_percentage);
          sub_ingredients_formula.push(JSON.parse(JSON.stringify(element)));
        }
      });
      if (sub_ingredients_formula.length > 0) {
        this.getIngredientsCalculatedPercentages(
          0,
          0,
          ingredients,
          sub_ingredients_formula,
          all_ingredients_formula
        );
      }

      //Gets new values of ingredients
      ingredients.forEach((ingredient) => {
        if (!ingredient.ingredient.formula) {
          item.ingredient.formula.ingredients.forEach((ingredientFormula) => {
            if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
              ingredient.percentage =
                ingredient.percentage -
                ingredientFormula.percentage * Number(bakers_percentage);
            }
          });
        }
      });
    });
  }

  public getIngredientsWithFormulaCalculatedPercentages(
    formula_weight: number,
    original_bakers_percentage: number,
    ingredients: Array<IngredientPercentageModel>,
    ingredients_formula: Array<any>,
    original_ingredients: Array<IngredientPercentageModel>
  ) {
    //Gets new total flour of formula
    let total_flour = this.totalFlour(ingredients);
    let proportion_factor;
    ingredients_formula.forEach((item) => {
      if (!item.prop_factor) {
        proportion_factor = this.getProportionFactor(
          formula_weight,
          original_bakers_percentage,
          item,
          original_ingredients
        );
      } else {
        proportion_factor = item.prop_factor;
      }
      ingredients.forEach((ingredient) => {
        if (item.ingredient.id == ingredient.ingredient.id) {
          ingredient.percentage = Number(
            (proportion_factor * (100 / total_flour)).toFixed(
              DECIMALS.formula_grams
            )
          );
        }
      });
    });
  }

  public calculateIngredientsWithFormula(
    ingredients: Array<IngredientPercentageModel>,
    all_ingredients_formula: Array<IngredientPercentageModel>,
    bakers_percentage: string,
    total_weight: number
  ) {
    let original_ingredients = JSON.parse(JSON.stringify(ingredients));

    //Identifies ingredients with formula
    let ingredients_formula = [];
    this.getIngredientsWithFormula(ingredients, ingredients_formula);

    if (ingredients_formula.length > 0) {
      ingredients.forEach((item) => {
        if (!item.ingredient.formula) {
          item.percentage = item.percentage * Number(bakers_percentage);
        }
      });

      this.getIngredientsCalculatedPercentages(
        total_weight,
        Number(bakers_percentage),
        ingredients,
        ingredients_formula,
        all_ingredients_formula
      );

      //Gets new percentage of ingredient with formula
      this.getIngredientsWithFormulaCalculatedPercentages(
        total_weight,
        Number(bakers_percentage),
        ingredients,
        ingredients_formula,
        original_ingredients
      );

      //Gets new bakers percentage
      bakers_percentage = (this.totalFlour(ingredients) / 100).toFixed(
        DECIMALS.bakers_percentage
      );

      //Sets ingredients
      ingredients = this.fromRecipeToFormula(ingredients);

      return bakers_percentage;
    }
  }

  public sortIngredients(ingredients: any) {
    ingredients.sort(
      (a: IngredientPercentageModel, b: IngredientPercentageModel) => {
        let num = 0;
        if (b.percentage > a.percentage) {
          num = 1;
        } else {
          num = -1;
        }
        if (a.ingredient.is_flour === b.ingredient.is_flour) {
          num = num;
        } else {
          if (a.ingredient.is_flour) {
            num = num - 1;
          } else {
            num = num + 1;
          }
        }
        if (
          (a.ingredient.formula === null ||
            a.ingredient.formula === undefined) ===
          (b.ingredient.formula === null || b.ingredient.formula === undefined)
        ) {
          num = num;
        } else {
          if (a.ingredient.formula) {
            num = num + 1;
          } else {
            num = num - 10;
          }
        }
        return num;
      }
    );
    return ingredients;
  }

  calculateTimeBeforeOven(steps: Array<StepDetailsModel>): number {
    let time: number = 0;
    for (let index = 0; index < OVEN_STEP - 1; index++) {
      time = time + steps[index].time;
    }
    return time;
  }

  calculateTime(steps: Array<StepDetailsModel>): number {
    let time: number = 0;
    steps.forEach((step) => {
      time = time + step.time;
    });
    return time;
  }
}

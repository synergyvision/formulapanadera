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
      let formula: FormulaModel = JSON.parse(JSON.stringify(item))
      let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(item))
      formula_without_compound.ingredients.forEach((ingredient, index) => {
        if (ingredient.ingredient.formula) {
          formula_without_compound.ingredients.splice(
            index,
            1
          );
        }
      })
      this.deleteIngredientsWithFormula(formula, formula_without_compound)
      hydration = Number(this.calculateHydration(formula_without_compound.ingredients));
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
      let formula: FormulaModel = JSON.parse(JSON.stringify(item))
      let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(item))
      formula_without_compound.ingredients.forEach((ingredient, index) => {
        if (ingredient.ingredient.formula) {
          formula_without_compound.ingredients.splice(
            index,
            1
          );
        }
      })
      bakers_percentage = Number(this.deleteIngredientsWithFormula(formula, formula_without_compound))
      cost =
        Number(this.calculateTotalCost(formula_without_compound.ingredients, bakers_percentage)) /
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
    ingredients: Array<IngredientPercentageModel>
  ): string {
    let percentage: number = 0;
    ingredients.forEach((ingredientData) => {
      percentage = percentage + Number(ingredientData.percentage);
    });
    return (total_weight / percentage).toString()
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
    return cost.toString();
  }

  public fromRecipeToFormula(ingredients: Array<IngredientPercentageModel>, calculate_compound: boolean = false) {
    let bakers_percentage = this.totalFlour(ingredients) / 100;
    ingredients.forEach((ingredient) => {
      if (calculate_compound || (!calculate_compound && !ingredient.ingredient.formula)) {
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

  public getAllIngredientsWithFormula(
    original_bakers_percentage: number,
    ingredients: Array<IngredientPercentageModel>,
    ingredients_formula: Array<any>,
    all_ingredients_formula: Array<any>
  ) {
    let bakers_percentage: string;
    let proportion_factor: number;

    if (ingredients_formula.length > 0) {
      ingredients_formula.forEach((item) => {
        if (!item.prop_factor) {
          proportion_factor = item.percentage * original_bakers_percentage
        } else {
          proportion_factor = item.prop_factor;
        }
        bakers_percentage = this.calculateBakersPercentage(
          proportion_factor,
          item.ingredient.formula.ingredients,
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
          this.getAllIngredientsWithFormula(0, ingredients, sub_ingredients_formula, all_ingredients_formula)
        }
      });
    }
  }

  public getProportionFactor(
    weight: number,
    bakers_percentage: number,
    item: IngredientPercentageModel,
    ingredients: Array<IngredientPercentageModel>
  ): number {
    if (item.ingredient.formula.proportion_factor.factor == "dough") {
      return Number(weight);
    } else if (item.ingredient.formula.proportion_factor.factor == "flour") {
      return Number(bakers_percentage) * 100;
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
      return ingredientWeight;
    }
  }

  public getIngredientsCalculatedPercentages(
    formula_weight: number,
    original_bakers_percentage: number,
    ingredients: Array<IngredientPercentageModel>,
    ingredients_formula: Array<any>,
    type: "ADD" | "DELETE" = "ADD",
    all_ingredients_formula?: Array<any>
  ) {
    let bakers_percentage: string;
    let proportion_factor: number;
    ingredients_formula.forEach((item) => {
      if (type == "DELETE") {
        proportion_factor = item.percentage * original_bakers_percentage
      } else {
        // Get bakers percentage from certain factor
        if (!item.prop_factor) {
          proportion_factor = (item.percentage / 100) * this.getProportionFactor(
            formula_weight,
            original_bakers_percentage,
            item,
            ingredients
          );
        } else {
          proportion_factor = item.prop_factor;
        }
      }
      bakers_percentage = this.calculateBakersPercentage(
        proportion_factor,
        item.ingredient.formula.ingredients,
      );
      item.bakers_percentage = bakers_percentage;

      if(all_ingredients_formula){
        all_ingredients_formula.push(item)
      }

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
          type,
          all_ingredients_formula
        );
      }

      //Gets new values of ingredients
      ingredients.forEach((ingredient) => {
        if (!ingredient.ingredient.formula) {
          item.ingredient.formula.ingredients.forEach((ingredientFormula) => {
            if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
              if (type == "ADD") {
                ingredient.percentage =
                  ingredient.percentage -
                  ingredientFormula.percentage * Number(bakers_percentage);
              } else if (type == "DELETE") {
                ingredient.percentage =
                  ingredient.percentage +
                  ingredientFormula.percentage * Number(bakers_percentage);
              }
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
    original_ingredients: Array<IngredientPercentageModel>,
  ) {
    //Gets new total flour of formula
    let total_flour = this.totalFlour(ingredients);
    let proportion_factor;
    ingredients_formula.forEach((item) => {
      if (!item.prop_factor) {
        proportion_factor = (item.percentage / 100) * this.getProportionFactor(
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
              DECIMALS.formula_percentage
            )
          );
        }
      });
    });
  }

  public deleteIngredientsWithFormula(original_formula: FormulaModel, formula: FormulaModel) {
    let initial_formula = JSON.parse(JSON.stringify(original_formula));

    //Identifies ingredients with formula
    let ingredients_formula = [];
    this.getIngredientsWithFormula(initial_formula.ingredients, ingredients_formula);

    if (ingredients_formula.length > 0) {
      let formula_weight = initial_formula.unit_weight * initial_formula.units
      let bakers_percentage = this.calculateBakersPercentage(formula_weight, initial_formula.ingredients)
      
      formula.ingredients.forEach((item) => {
        if (!item.ingredient.formula) {
          item.percentage = item.percentage * Number(bakers_percentage);
        }
      });
      this.getIngredientsCalculatedPercentages(
        formula_weight,
        Number(bakers_percentage),
        formula.ingredients,
        ingredients_formula,
        "DELETE"
      );

      //Sets ingredients
      formula.ingredients = this.fromRecipeToFormula(formula.ingredients);

      let percentage: number = 0;
      formula.ingredients.forEach((ingredientData) => {
        if (!ingredientData.ingredient.formula) {
          percentage = percentage + Number(ingredientData.percentage);
        }
      });
      let new_bakers_percentage = (formula_weight / percentage).toString();

      return new_bakers_percentage
    }
  }

  public calculateIngredientsWithFormula(
    ingredients: Array<IngredientPercentageModel>,
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
      bakers_percentage = (this.totalFlour(ingredients) / 100).toString();

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

  // Sort
  sortFormulas(formulas: FormulaModel[]): FormulaModel[] & ShellModel {
    return formulas.sort(function (a, b) {
      if (a.name && b.name) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        if (b.name.toUpperCase() > a.name.toUpperCase()) {
          return -1;
        }
      }
      return 0;
    }) as FormulaModel[] & ShellModel
  }
}

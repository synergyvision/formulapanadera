import { Injectable } from "@angular/core";
import {
  FormulaModel,
  IngredientPercentageModel,
  StepDetailsModel,
} from "../models/formula.model";

import { DECIMALS } from "src/app/config/formats";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { OVEN_STEP } from "src/app/config/formula";
import { BehaviorSubject, Observable } from "rxjs";
import { LOADING_ITEMS } from "src/app/config/configuration";
import { IngredientModel } from "../models/ingredient.model";
import { FormulaCRUDService } from "./firebase/formula.service";

@Injectable()
export class FormulaService {
  private formulas: BehaviorSubject<FormulaModel[]> = new BehaviorSubject<FormulaModel[]>(undefined);

  constructor(
    private formulaCRUDService: FormulaCRUDService
  ) {}

  public setFormulas(formulas: FormulaModel[] & ShellModel) {
    this.formulas.next(formulas);
  }

  public getFormulas(): Observable<FormulaModel[]> {
    return this.formulas.asObservable();
  }

  public getCurrentFormulas(): FormulaModel[] {
    return this.formulas.getValue();
  }

  public clearFormulas() {
    this.formulas = new BehaviorSubject<FormulaModel[]>(undefined);
  }

  public searchingState() {
    let searchingShellModel: FormulaModel[] &
      ShellModel = [] as FormulaModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new FormulaModel());
    }
    searchingShellModel.isShell = true;
    return searchingShellModel;
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
      let formula_without_compound: FormulaModel = this.getFormulaWithoutCompoundIngredients(item).formula;
      hydration = Number(this.calculateHydration(formula_without_compound.ingredients));
      if (hydration >= lower && hydration <= upper) {
        filtered.push(item);
      }
    });
    return filtered as FormulaModel[] & ShellModel;
  }

  public searchFormulasByFat(
    lower: number,
    upper: number,
    formulas: FormulaModel[] & ShellModel
  ): FormulaModel[] & ShellModel {
    const filtered = [];
    let fat: number;
    formulas.forEach((item) => {
      let formula_without_compound: FormulaModel = this.getFormulaWithoutCompoundIngredients(item).formula;
      fat = Number(this.calculateFat(formula_without_compound.ingredients));
      if (fat >= lower && fat <= upper) {
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
      let formula_without_compound = this.getFormulaWithoutCompoundIngredients(item);
      bakers_percentage = Number(formula_without_compound.bakers_percentage);
      if (isNaN(bakers_percentage)) {
        bakers_percentage = Number(this.calculateBakersPercentage(item.units * item.unit_weight, item.ingredients));
      }
      cost =
        Number(this.calculateTotalCost(formula_without_compound.formula.ingredients, bakers_percentage)) /
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
    return filtered as FormulaModel[] & ShellModel;
  }

  /*
  Update
  */
  
  public hasIngredient(formula: FormulaModel, updated_ingredients: IngredientModel[]): boolean {
    let original_formula: FormulaModel = JSON.parse(JSON.stringify(formula));
    let has_ingredient: boolean = false;
    let updated_compound_ingredient: boolean = false;
    formula.ingredients.forEach(ingredient => {
      updated_ingredients.forEach(updated_ingredient => {
        if (ingredient.ingredient.id == updated_ingredient.id) {
          has_ingredient = true;
          ingredient.ingredient = updated_ingredient;
          if (updated_ingredient.formula) {
            updated_compound_ingredient = true;
          }
        }
      })
    });
    if (has_ingredient) {
      formula.mixing?.forEach(mix => {
        mix.mixing_order.forEach(step => {
          step.ingredients.forEach(ingredient => {
            updated_ingredients.forEach(updated_ingredient => {
              if (ingredient.ingredient.id == updated_ingredient.id) {
                ingredient.ingredient = updated_ingredient;
              }
            })
          })
        })
      })
      if (updated_compound_ingredient) {
        this.recalculateFormula(original_formula, formula);
      }
    }
    formula.steps?.forEach(step => {
      step.ingredients?.forEach(ingredient => {
        updated_ingredients.forEach(updated_ingredient => {
          if (ingredient.ingredient.id == updated_ingredient.id) {
            has_ingredient = true;
            ingredient.ingredient = updated_ingredient;
          }
        })
      })
    })
    return has_ingredient;
  }

  public async updateIngredients(updated_ingredients: IngredientModel[], updated_formulas: FormulaModel[]) {
    let formulas: FormulaModel[] = JSON.parse(JSON.stringify(this.getCurrentFormulas()));
    const for_promises = formulas.map((formula) => {
      let original_formula: FormulaModel = JSON.parse(JSON.stringify(formula));
      let has_ingredient: boolean = this.hasIngredient(formula, updated_ingredients);
      if (has_ingredient) {
        updated_formulas.push(formula)
        return this.formulaCRUDService.updateFormula(formula, original_formula);
      }
    })
    await Promise.all(for_promises);
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
      if (!ingredientData.ingredient.formula && ingredientData.ingredient.hydration) {
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
      if (!ingredientData.ingredient.formula && ingredientData.ingredient.fat) {
        fat =
          ingredientData.percentage * ingredientData.ingredient.fat +
          fat;
      }
    });
    return (fat / 100).toFixed(DECIMALS.fat);
  }

  public calculateTotalCost(
    ingredients: Array<IngredientPercentageModel>,
    bakers_percentage: number
  ): string {
    let cost: number = 0;
    ingredients.forEach((ingredientData) => {
      if (!ingredientData.ingredient.formula && ingredientData.ingredient.cost) {
        cost =
          ingredientData.percentage *
            bakers_percentage *
            ingredientData.ingredient.cost +
          cost;
      }
    });
    return cost.toString();
  }

  public getFormulaWithoutCompoundIngredients(
    item: FormulaModel
  ): { formula: FormulaModel, bakers_percentage: string }  {
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
    let bakers_percentage = this.deleteIngredientsWithFormula(formula, formula_without_compound)
    return { formula: formula_without_compound, bakers_percentage: bakers_percentage };
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

  public fromFormulaToRecipe(ingredients: Array<IngredientPercentageModel>, unit_weight: number, units: number) {
    let bakers_percentage = this.calculateBakersPercentage(
      units * unit_weight,
      ingredients
    )
    
    ingredients.forEach((ingredient) => {
      ingredient.percentage = Number(
        (ingredient.percentage * Number(bakers_percentage)).toFixed(
          DECIMALS.formula_percentage
        )
      );
    });
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

  public formulaWeight(ingredients: Array<IngredientPercentageModel>) {
    let grams = 0;
    ingredients.forEach((ingredient) => {
        grams = grams + ingredient.percentage;
    });
    return grams;
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
          formula_weight,
          Number(bakers_percentage),
          ingredients,
          sub_ingredients_formula,
          type,
          all_ingredients_formula
        );
      }

      //Gets new values of ingredients
      ingredients.forEach((ingredient) => {
        if (!ingredient.ingredient.formula) {
          item.ingredient.formula.ingredients.forEach((ingredientFormula: IngredientPercentageModel) => {
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
      if (type == "DELETE") {
        item.ingredient.formula.ingredients.forEach((ingredientFormula: IngredientPercentageModel) => {
          if (!ingredientFormula.ingredient.formula) {
            let exists = false;
            ingredients.forEach((ingredient) => {
              if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
                exists = true;
              }
            });
            if (!exists) {
              ingredients.push(ingredientFormula);
              ingredientFormula.percentage = ingredientFormula.percentage * Number(bakers_percentage);
            }
          }
        });
      }
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

  private recalculateFormula(original_formula: FormulaModel,formula: FormulaModel) {
    let total_weight = formula.units * formula.unit_weight;
    let actual_bakers_percentage: string = this.calculateBakersPercentage(
      total_weight,
      formula.ingredients
    );
    let new_bakers_percentage: string = this.deleteIngredientsWithFormula(original_formula, formula);
    let proportion_factor: number;
    formula.ingredients.forEach(ingredient => {
      if (ingredient.ingredient.formula) {
        original_formula.ingredients.forEach(original_ing => {
          if (ingredient.ingredient.id == original_ing.ingredient.id) {
            proportion_factor = this.getProportionFactor(
              total_weight,
              Number(new_bakers_percentage),
              original_ing,
              formula.ingredients
            );
          }
        })
        ingredient.percentage = (ingredient.percentage * Number(actual_bakers_percentage) / proportion_factor) * 100;
      }
    });
    this.calculateIngredientsWithFormula(
      formula.ingredients,
      new_bakers_percentage,
      Number(total_weight)
    );
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
    ingredients.sort((a: IngredientPercentageModel, b: IngredientPercentageModel) => {
      return (a.ingredient.is_flour === b.ingredient.is_flour)? 0 : a.ingredient.is_flour? -1 : 1;
    })
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

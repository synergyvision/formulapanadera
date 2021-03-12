import { Injectable } from "@angular/core";
import {
  FormulaPresentModel,
  ProductionModel,
  ProductionStepModel,
} from "../models/production.model";
import { FormulaModel, IngredientPercentageModel } from "../models/formula.model";
import { DECIMALS } from "src/app/config/formats";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "./formula.service";
import { OVEN_STEP } from "src/app/config/formula";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class ProductionService {
  private productions: BehaviorSubject<ProductionModel[]> = new BehaviorSubject<ProductionModel[]>(undefined);

  constructor(private formulaService: FormulaService) { }
  
  public setProductions(productions: ProductionModel[] & ShellModel) {
    this.productions.next(productions);
  }

  public getProductions(): Observable<ProductionModel[]> {
    return this.productions.asObservable();
  }

  public clearProductions() {
    this.productions = new BehaviorSubject<ProductionModel[]>(undefined);
  }

  /*
    Production filters
  */
  public searchProductionsByCost(
    lower: number,
    upper: number,
    productions: ProductionModel[] & ShellModel
  ): ProductionModel[] & ShellModel {
    const filtered = [];
    let cost: number;
    productions.forEach((item) => {
      cost = this.calculateProductionCost(item);
      if (
        (cost >= lower || lower == null) &&
        (cost <= upper || upper == null)
      ) {
        filtered.push(item);
      }
    });
    return filtered as ProductionModel[] & ShellModel;
  }

  public searchProductionsByShared(
    type: string,
    productions: ProductionModel[] & ShellModel,
    user_email: string
  ): ProductionModel[] & ShellModel {
    const filtered = [];
    productions.forEach((item) => {
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
    return filtered as ProductionModel[] & ShellModel;
  }

  /*
    Production calculations
  */
  public calculateTotalUnits(formulas: Array<FormulaPresentModel>): number {
    let units: number = 0;
    formulas.forEach((data) => {
      units = units + data.number;
    });
    return units;
  }

  public calculateTotalCost(formulas: Array<FormulaPresentModel>): number {
    let cost: number = 0;
    formulas.forEach((data) => {
      cost = cost + Number(data.total_cost);
    });
    return cost;
  }

  public calculateProductionCost(production: ProductionModel): number {
    let cost = 0;
    let bakers_percentage: number;

    production.formulas.forEach((item) => {
      let formula: FormulaModel = JSON.parse(JSON.stringify(item.formula))
      let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(item.formula))
      formula_without_compound.ingredients.forEach((ingredient, index) => {
        if (ingredient.ingredient.formula) {
          formula_without_compound.ingredients.splice(
            index,
            1
          );
        }
      })
      bakers_percentage = Number(this.formulaService.deleteIngredientsWithFormula(formula, formula_without_compound))
      cost =
        cost +
        Number(
          this.formulaService.calculateTotalCost(
            formula_without_compound.ingredients,
            bakers_percentage
          )
        );
    });

    return cost;
  }

  public calculateTotalIngredients(
    formulas: Array<FormulaPresentModel>
  ): Array<IngredientPercentageModel> {
    let ingredients: Array<IngredientPercentageModel> = [];
    let exists: boolean;
    formulas.forEach((formula) => {
      formula.formula.ingredients.forEach((ingredient) => {
        exists = false;
        ingredients.forEach((pushed_ingredient) => {
          if (pushed_ingredient.ingredient.id === ingredient.ingredient.id) {
            exists = true;
            pushed_ingredient.percentage =
              pushed_ingredient.percentage +
              ingredient.percentage * Number(formula.bakers_percentage);
          }
        });
        if (!exists) {
          ingredients.push({
            ingredient: ingredient.ingredient,
            percentage:
              ingredient.percentage * Number(formula.bakers_percentage),
          });
        }
      });
    });
    ingredients.forEach((item) => {
      item.percentage = Number(item.percentage.toFixed(DECIMALS.formula_grams));
    });
    return ingredients;
  }

  public calculateTimeBeforeOven(steps: Array<ProductionStepModel>): number {
    let time: number = 0;
    for (let index = 0; index < OVEN_STEP - 1; index++) {
      if (steps[index].status !== "DONE") {
        time = time + steps[index].step.time;
      }
    }
    return time;
  }

  public calculateTimeAfterOven(steps: Array<ProductionStepModel>): number {
    let time_before: number = this.calculateTimeBeforeOven(steps);
    return time_before + steps[OVEN_STEP - 1].step.time;
  }

  // Sort
  sortProductions(productions: ProductionModel[]): ProductionModel[] & ShellModel {
    return productions.sort(function (a, b) {
      if (a.name && b.name) {
        if (a.name.toUpperCase() > b.name.toUpperCase()) {
          return 1;
        }
        if (b.name.toUpperCase() > a.name.toUpperCase()) {
          return -1;
        }
      }
      return 0;
    }) as ProductionModel[] & ShellModel
  }
}

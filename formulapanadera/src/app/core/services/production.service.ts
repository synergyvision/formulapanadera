import { Injectable } from "@angular/core";
import {
  FormulaPresentModel,
  ProductionInProcessModel,
  ProductionModel,
  ProductionStepModel,
  TimeModel,
} from "../models/production.model";
import {
  IngredientPercentageModel,
  StepDetailsModel,
} from "../models/formula.model";
import { DECIMALS } from "src/app/config/formats";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "./formula.service";
import { TimeService } from "./time.service";

@Injectable()
export class ProductionService {
  constructor(
    private formulaService: FormulaService,
    private timeService: TimeService
  ) {}

  /*
  Production filters
  */
  searchProductionsByCost(
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

    production.formulas.forEach((formula) => {
      bakers_percentage = Number(
        this.formulaService.calculateBakersPercentage(
          formula.number * formula.formula.unit_weight,
          formula.formula.ingredients
        )
      );
      cost =
        cost +
        Number(
          this.formulaService.calculateTotalCost(
            formula.formula.ingredients,
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

  public getProductionInProcess(
    production: ProductionModel
  ): ProductionInProcessModel {
    let date: Date = this.timeService.currentDate();
    let production_steps: Array<ProductionStepModel> = [];
    let previous_end_date: Date = null;
    let estimated_time: TimeModel;
    production.formulas.forEach((item) => {
      previous_end_date = null;
      item.formula.steps.forEach((step) => {
        estimated_time = this.calculateEstimatedTime(
          date,
          step,
          previous_end_date
        );
        production_steps.push({
          status: "PENDING",
          formula: {
            id: item.formula.id,
            name: item.formula.name,
          },
          step: step,
          time: estimated_time,
        });
        previous_end_date = estimated_time.end;
      });
    });
    return {
      time: date,
      steps: production_steps,
    };
  }

  public calculateEstimatedTime(
    start_date: Date,
    step: StepDetailsModel,
    previous_end_date?: Date
  ): TimeModel {
    let estimated_start: Date;
    let estimated_end: Date;
    if (previous_end_date) {
      estimated_start = previous_end_date;
    } else {
      estimated_start = start_date;
    }
    estimated_end = this.timeService.addTime(estimated_start, step.time, "m");
    return {
      start: estimated_start,
      end: estimated_end,
    };
  }
}

import { Injectable } from "@angular/core";
import {
  FormulaNumberModel,
  FormulaPresentModel,
  ProductionFormulaStepsModel,
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
import { OVEN_STEP } from "src/app/config/formula";

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

  private calculateTimeBeforeOven(steps: Array<ProductionStepModel>): number {
    let time: number = 0;
    for (let index = 0; index < OVEN_STEP - 1; index++) {
      time = time + steps[index].step.time;
    }
    return time;
  }

  private calculateTimeAfterOven(steps: Array<ProductionStepModel>): number {
    let time_before: number = this.calculateTimeBeforeOven(steps);
    return time_before + steps[OVEN_STEP].step.time;
  }

  /*
    Production steps
  */
  public getProductionSteps(
    production: ProductionModel
  ): ProductionInProcessModel {
    let production_steps: Array<ProductionStepModel> = [];
    production.formulas.forEach((item) => {
      item.formula.steps.forEach((step) => {
        production_steps.push({
          status: "PENDING",
          formula: {
            id: item.formula.id,
            name: item.formula.name,
          },
          step: step,
          time: null,
        });
      });
    });
    return {
      time: null,
      steps: production_steps,
    };
  }

  public startProduction(
    formulas: Array<FormulaNumberModel>,
    production_in_process: ProductionInProcessModel
  ): ProductionInProcessModel {
    // Production start time
    let date: Date = this.timeService.currentDate();
    production_in_process.time = date;

    // Production organized in its formulas
    let production_formulas = this.getProductionFormulasWithSteps(
      formulas,
      production_in_process
    );
    // Organize production formulas by oven order
    production_formulas = this.getProductionOvenOrder(production_formulas);

    // Set variables and start production times calculations
    let previous_formula_start: Date = null;
    let previous_end_date: Date = null;
    let estimated_time: TimeModel;
    production_in_process.steps = [];
    production_formulas.forEach((formula, index) => {
      // If it's different from the first formula
      if (index !== 0) {
        // Check previous oven end time
        let previous_time_after_oven = this.calculateTimeAfterOven(
          production_formulas[index - 1].steps
        );
        let new_time_before_oven = this.calculateTimeBeforeOven(
          production_formulas[index].steps
        );
        // Set this formula oven time after previous oven time
        // Get previous formula oven ending
        let previous_formula_oven_end = this.timeService.addTime(
          previous_formula_start,
          previous_time_after_oven,
          "m"
        );

        let new_formula_start = this.timeService.subtractTime(
          previous_formula_oven_end,
          new_time_before_oven,
          "m"
        );

        // If oven time was already after previous oven end start now, else set calculated start
        if (this.timeService.dateIsAfterNow(new_formula_start)) {
          previous_end_date = new_formula_start;
        } else {
          previous_end_date = null;
        }
      } else {
        previous_end_date = null;
      }
      formula.steps.forEach((step, index) => {
        estimated_time = this.calculateEstimatedTime(
          date,
          step.step,
          previous_end_date
        );
        step.time = estimated_time;
        if (index == 0) {
          previous_formula_start = estimated_time.start;
        }
        previous_end_date = estimated_time.end;
        production_in_process.steps.push(step);
      });
    });

    return production_in_process;
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
      estimated_start = this.timeService.addTime(start_date, 1, "m");
    }
    estimated_end = this.timeService.addTime(estimated_start, step.time, "m");
    return {
      start: estimated_start,
      end: estimated_end,
    };
  }

  public getProductionFormulasWithSteps(
    formulas: Array<FormulaNumberModel>,
    production_in_process: ProductionInProcessModel
  ): Array<ProductionFormulaStepsModel> {
    let formulas_steps: Array<ProductionFormulaStepsModel> = [];
    formulas.forEach((formula) => {
      let result = [];
      production_in_process.steps.forEach((step) => {
        if (step.formula.id === formula.formula.id) {
          result.push(step);
        }
      });
      formulas_steps.push({
        formula: { id: formula.formula.id, name: formula.formula.name },
        steps: result,
      });
    });
    return formulas_steps;
  }

  /*
    Production sort
  */
  // Sorts formulas by oven order (asc)
  public getProductionOvenOrder(
    formula_steps: Array<ProductionFormulaStepsModel>
  ): Array<ProductionFormulaStepsModel> {
    return formula_steps.sort(
      (a: ProductionFormulaStepsModel, b: ProductionFormulaStepsModel) => {
        let num = 0;
        if (
          this.calculateTimeBeforeOven(a.steps) >
          this.calculateTimeBeforeOven(b.steps)
        ) {
          num = 1;
        } else {
          num = -1;
        }
        return num;
      }
    );
  }

  public sortStepsByTime(
    steps: Array<ProductionStepModel>
  ): Array<ProductionStepModel> {
    return steps.sort((a: ProductionStepModel, b: ProductionStepModel) => {
      let num = 0;
      if (a.time.start >= b.time.start) {
        num = 1;
      } else {
        num = -1;
      }
      if (
        this.timeService.difference(a.time.start, a.time.end) >
        this.timeService.difference(b.time.start, b.time.end)
      ) {
        num = num - 0.1;
      } else {
        num = num + 0.1;
      }

      return num;
    });
  }
}

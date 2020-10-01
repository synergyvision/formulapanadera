import { Injectable } from "@angular/core";
import {
  FormulaPresentModel,
  FormulaResumeModel,
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
import { BehaviorSubject } from "rxjs";
import { ProductionService } from './production.service';

@Injectable()
export class ProductionInProcessService {
  production_in_process: ProductionInProcessModel = new ProductionInProcessModel();
  private behaviorSubject: BehaviorSubject<ProductionInProcessModel>;

  constructor(
    private productionService: ProductionService,
    private timeService: TimeService
  ) {
    this.behaviorSubject = new BehaviorSubject<ProductionInProcessModel>(
      new ProductionInProcessModel()
    );
  }

  public setProductionInProcess(newValue: ProductionInProcessModel): void {
    this.behaviorSubject.next(newValue);
  }

  public getProductionInProcess() {
    return this.behaviorSubject.asObservable();
  }

  /*
    Production calculations
  */
  private calculateFormulaTimes(
    previous_formula: ProductionFormulaStepsModel,
    current_formula: ProductionFormulaStepsModel,
    previous_start: Date
  ): Date | null {
    // Check previous oven end time
    let previous_time_after_oven = this.productionService.calculateTimeAfterOven(
      previous_formula.steps
    );
    let new_time_before_oven = this.productionService.calculateTimeBeforeOven(
      current_formula.steps
    );
    // Set this formula oven time after previous oven time
    // Get previous formula oven ending
    let previous_formula_oven_end = this.timeService.addTime(
      previous_start,
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
      return new_formula_start;
    } else {
      return null;
    }
  }

  public productionStarted(steps: Array<ProductionStepModel>): boolean {
    let started = false;
    steps.forEach((step) => {
      if (step.status !== "PENDING") {
        started = true;
      }
    });
    return started;
  }

  public productionEnded(steps: Array<ProductionStepModel>): boolean {
    let ended = true;
    steps.forEach((step) => {
      if (step.status !== "DONE") {
        ended = false;
      }
    });
    return ended;
  }

  public stepIsBlocked(
    production: ProductionInProcessModel,
    step: ProductionStepModel
  ): boolean {
    let is_blocked: boolean = true;

    if (!this.productionStarted(production.steps)) {
      if (step.step.number === 0) {
        is_blocked = false;
      }
    }

    return is_blocked;
  }

  /*
    Production steps
  */
  public getProductionFormulas(
    production_in_process: ProductionInProcessModel
  ): Array<FormulaResumeModel> {
    let formulas: Array<FormulaResumeModel> = [];
    let contains: boolean;
    production_in_process.steps.forEach((step) => {
      contains = false;
      formulas.forEach((formula) => {
        if (formula.id === step.formula.id) {
          contains = true;
        }
      });
      if (!contains) {
        formulas.push(step.formula);
      }
    });
    return formulas;
  }

  public getProductionSteps(production: ProductionModel) {
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
    this.setProductionInProcess({
      time: null,
      steps: production_steps,
    });
  }

  public getProductionFormulasWithSteps(
    production_in_process: ProductionInProcessModel
  ): Array<ProductionFormulaStepsModel> {
    let formulas_steps: Array<ProductionFormulaStepsModel> = [];
    let formulas: Array<FormulaResumeModel> = this.getProductionFormulas(
      production_in_process
    );
    formulas.forEach((formula) => {
      let result = [];
      production_in_process.steps.forEach((step) => {
        if (step.formula.id === formula.id) {
          result.push(step);
        }
      });
      formulas_steps.push({
        formula: { id: formula.id, name: formula.name },
        steps: result,
      });
    });
    return formulas_steps;
  }

  public orderProduction(production_in_process: ProductionInProcessModel) {
    // Production start time
    let date: Date = this.timeService.currentDate();
    production_in_process.time = new TimeModel();
    production_in_process.time.start = date;

    // Get production organized in its formulas
    let production_formulas = this.getProductionFormulasWithSteps(
      production_in_process
    );

    let userStarted: boolean = this.productionStarted(production_in_process.steps);
    if (userStarted) {
      // Organize production formulas by user order
      production_formulas = this.getProductionUserOrder(production_formulas);
    } else {
      // Organize production formulas by oven order
      production_formulas = this.getProductionOvenOrder(production_formulas);
    }

    // Set variables and start production times calculations
    let previous_formula_start: Date = null;
    let previous_end_date: Date = null;
    let estimated_time: TimeModel;
    production_in_process.steps = [];
    production_formulas.forEach((formula, index) => {
      // If it's different from the first formula
      if (index !== 0) {
        previous_end_date = this.calculateFormulaTimes(
          production_formulas[index - 1],
          production_formulas[index],
          previous_formula_start
        );
      } else {
        previous_end_date = null;
      }
      formula.steps.forEach((step, index) => {
        if (step.status !== "DONE") {
          estimated_time = this.calculateEstimatedTime(
            step.step,
            previous_end_date
          );
          step.time = estimated_time;
        }
        if (index == 0) {
          previous_formula_start = step.time.start;
        }

        previous_end_date = step.time.end;
        production_in_process.steps.push(step);
      });
    });

    production_in_process = this.sortStepsByTime(production_in_process);

    let last_index: number;
    last_index = production_in_process.steps.length - 1;
    production_in_process.time.end =
      production_in_process.steps[last_index].time.end;

    this.setProductionInProcess(production_in_process);
  }

  public calculateEstimatedTime(
    step: StepDetailsModel,
    previous_end_date?: Date
  ): TimeModel {
    let estimated_start: Date;
    let estimated_end: Date;
    if (previous_end_date) {
      estimated_start = previous_end_date;
    } else {
      estimated_start = this.timeService.addTime(
        this.timeService.currentDate(),
        1,
        "m"
      );
    }
    estimated_end = this.timeService.addTime(estimated_start, step.time, "m");
    return {
      start: estimated_start,
      end: estimated_end,
    };
  }

  public verifyLaboralTime(
    production_in_process: ProductionInProcessModel,
    laboral_time: TimeModel
  ): Array<ProductionStepModel> {
    let invalid_steps: Array<ProductionStepModel> = [];
    production_in_process.steps.forEach((step) => {
      if (
        !this.timeService.timeIsInRange(step.time.start, laboral_time) ||
        !this.timeService.timeIsInRange(step.time.end, laboral_time)
      ) {
        invalid_steps.push(step);
      }
    });
    return invalid_steps;
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
          this.productionService.calculateTimeBeforeOven(a.steps) >
          this.productionService.calculateTimeBeforeOven(b.steps)
        ) {
          num = 1;
        } else {
          num = -1;
        }
        return num;
      }
    );
  }

  public getProductionUserOrder(
    formula_steps: Array<ProductionFormulaStepsModel>
  ): Array<ProductionFormulaStepsModel> {
    let new_order: Array<ProductionFormulaStepsModel> = [];
    formula_steps.forEach((formula) => {
      if (this.productionStarted(formula.steps)) {
        new_order.push(formula);
        formula_steps.splice(formula_steps.indexOf(formula), 1);
      }
    });
    let non_started = this.getProductionOvenOrder(formula_steps);
    non_started.forEach((formula) => {
      new_order.push(formula);
    });
    return new_order;
  }

  // Sorts production steps by start time. When equal gives priority to the first to finish
  public sortStepsByTime(
    production: ProductionInProcessModel
  ): ProductionInProcessModel {
    return {
      time: production.time,
      steps: production.steps.sort(
        (a: ProductionStepModel, b: ProductionStepModel) => {
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
        }
      ),
    };
  }
}

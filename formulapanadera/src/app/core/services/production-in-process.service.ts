import { Injectable } from "@angular/core";
import {
  FormulaResumeModel,
  ProductionFormulaStepsModel,
  ProductionInProcessModel,
  ProductionModel,
  ProductionStepModel,
  TimeModel,
} from "../models/production.model";
import { StepDetailsModel } from "../models/formula.model";
import { TimeService } from "./time.service";
import { BehaviorSubject } from "rxjs";
import { ProductionService } from "./production.service";
import {
  MANIPULATION_STEP,
  OVEN_STARTING_TIME,
  OVEN_START_TIME,
  OVEN_STEP,
} from "src/app/config/formula";
import { LanguageService } from "./language.service";

@Injectable()
export class ProductionInProcessService {
  production_in_process: ProductionInProcessModel = new ProductionInProcessModel();
  private behaviorSubject: BehaviorSubject<ProductionInProcessModel>;

  constructor(
    private productionService: ProductionService,
    private timeService: TimeService,
    private languageService: LanguageService
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
    let new_time_before_oven =
      this.productionService.calculateTimeBeforeOven(current_formula.steps) -
      current_formula.formula.warming_time;
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
    selected_step: ProductionStepModel
  ): boolean {
    let is_blocked: boolean = true;
    let formulas: Array<ProductionFormulaStepsModel> = this.getProductionFormulasWithSteps(
      production
    );
    let number: number = 1;
    let step_before_number = 1;
    let step_before: ProductionStepModel;
    if (OVEN_STEP - 1 == selected_step.step.number) {
      step_before_number = 0.5;
    }

    // Unblock first possible step of each formula
    if (selected_step.step.number == 0) {
      is_blocked = false;
    } else if (this.productionStarted(production.steps)) {
      // Unblock if previous step is done
      formulas.forEach((formula) => {
        if (selected_step.formula.id == formula.formula.id) {
          formula.steps.forEach((step, index) => {
            if (
              selected_step.step.number - step_before_number ==
              step.step.number
            ) {
              step_before = step;
              while (step_before.step.time <= 0) {
                step_before = formula.steps[index - number];
                number = number + 1;
              }
              if (step_before.status == "DONE") {
                is_blocked = false;
              }
            }
          });
        }
      });
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
            warming_time: item.warming_time,
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
        formula: {
          id: formula.id,
          name: formula.name,
          warming_time: formula.warming_time,
        },
        steps: result,
      });
    });
    return formulas_steps;
  }

  private getWarmingStep(
    oven_step: ProductionStepModel,
    formula_warming_time: number,
    is_first_formula: boolean
  ): ProductionStepModel {
    let warming_step: ProductionStepModel = new ProductionStepModel();
    warming_step.status = "PENDING";
    warming_step.formula = oven_step.formula;
    warming_step.step = {
      number: OVEN_STEP - 0.5,
      name: "",
      description: "",
      time: OVEN_STARTING_TIME,
      temperature: oven_step.step.temperature,
    };
    if (is_first_formula) {
      warming_step.step.name = this.languageService.getTerm(
        "production.oven.start"
      );
      warming_step.time = {
        start: this.timeService.subtractTime(
          oven_step.time.start,
          OVEN_START_TIME,
          "m"
        ),
        end: this.timeService.subtractTime(
          oven_step.time.start,
          OVEN_START_TIME - OVEN_STARTING_TIME,
          "m"
        ),
      };
    } else {
      warming_step.step.name = this.languageService.getTerm(
        "production.oven.change_temperature"
      );
      warming_step.time = {
        start: this.timeService.subtractTime(
          oven_step.time.start,
          formula_warming_time,
          "m"
        ),
        end: this.timeService.subtractTime(
          oven_step.time.start,
          formula_warming_time - OVEN_STARTING_TIME,
          "m"
        ),
      };
    }
    return warming_step;
  }

  private getManipulationSteps(
    manipulation_step: ProductionStepModel,
    fermentation_step: ProductionStepModel
  ): Array<ProductionStepModel> {
    let manipulation_steps: Array<ProductionStepModel> = [];
    let time_difference: number = this.timeService.difference(
      fermentation_step.time.start,
      fermentation_step.time.end
    );
    time_difference = time_difference / (manipulation_step.step.times + 1);

    for (let index = 0; index < manipulation_step.step.times; index++) {
      let step: ProductionStepModel = {
        status: "PENDING",
        formula: manipulation_step.formula,
        step: manipulation_step.step,
      };

      step.time = new TimeModel();
      step.time.start = this.timeService.addTime(
        fermentation_step.time.start,
        time_difference,
        "m"
      );
      step.time.end = this.timeService.addTime(
        step.time.start,
        manipulation_step.step.time,
        "m"
      );

      manipulation_steps.push(step);

      time_difference += time_difference;
    }

    return manipulation_steps;
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

    let userStarted: boolean = this.productionStarted(
      production_in_process.steps
    );
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
    production_formulas.forEach((formula, formula_index) => {
      // If it's different from the first formula
      if (formula_index !== 0) {
        previous_end_date = this.calculateFormulaTimes(
          production_formulas[formula_index - 1],
          production_formulas[formula_index],
          previous_formula_start
        );
      } else {
        previous_end_date = null;
      }
      formula.steps.forEach((step, step_index) => {
        estimated_time = this.calculateEstimatedTime(
          step.step,
          previous_end_date
        );
        step.time = estimated_time;

        if (step_index == 0) {
          previous_formula_start = step.time.start;
        }

        // If step is oven step, insert oven warming step before
        if (step.step.number == OVEN_STEP - 1) {
          let warming_step = this.getWarmingStep(
            step,
            formula.formula.warming_time,
            formula_index == 0
          );
          production_in_process.steps.push(warming_step);
        }

        previous_end_date = step.time.end;

        // If step is manipulation step, insert multiple manipulations while formula fermentation
        if (step.step.number == MANIPULATION_STEP - 1 && step.step.time != 0) {
          let fermentation_step: ProductionStepModel =
            formula.steps[step_index - 1];
          let manipulation_steps: Array<ProductionStepModel> = this.getManipulationSteps(
            step,
            fermentation_step
          );
          manipulation_steps.forEach((step) => {
            production_in_process.steps.push(step);
          });
        } else {
          // Insert step
          production_in_process.steps.push(step);
        }
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

  public recalculateProduction(
    production_in_process: ProductionInProcessModel,
    selected_step: ProductionStepModel
  ) {
    let difference: number = 0;
    let is_different: boolean = false;
    let current_date = this.timeService.currentDate();

    if (
      selected_step.status == "PENDING" &&
      this.timeService.dateIsDifferentFromNow(selected_step.time.start)
    ) {
      is_different = true;
      difference = this.timeService.difference(
        selected_step.time.start,
        current_date
      );
    }
    if (
      selected_step.status == "IN PROCESS" &&
      this.timeService.dateIsDifferentFromNow(selected_step.time.end)
    ) {
      is_different = true;
      difference = this.timeService.difference(
        selected_step.time.end,
        current_date
      );
    }
    // When user starts or ends before or after calculated time
    if (is_different) {
      production_in_process.steps.forEach((step) => {
        if (step.status == "PENDING") {
          step.time.start = this.timeService.addTime(
            step.time.start,
            difference,
            "m"
          );
        }
        if (step.status !== "DONE") {
          step.time.end = this.timeService.addTime(
            step.time.end,
            difference,
            "m"
          );
        }
      });
    }

    this.setProductionInProcess(production_in_process);
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

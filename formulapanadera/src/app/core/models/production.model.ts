import { PRODUCTION_STEP_STATUS } from "src/app/config/formula";

import { FormulaModel, StepDetailsModel } from "./formula.model";
import { ModifierModel } from "./user.model";

export class FormulaNumberModel {
  formula: FormulaModel;
  number: number;
}

export class ProductionModel {
  id: string;
  name: string;
  formulas: Array<FormulaNumberModel>;
  owner: ModifierModel;
}

/* Presenting formulas to the user */
export class FormulaPresentModel extends FormulaNumberModel {
  bakers_percentage: string;
  total_cost: string;
  unitary_cost: string;
  ingredients_formula: Array<any>;
}

export class TimeModel {
  start: Date;
  end: Date;
}

export class FormulaResumeModel {
  id: string;
  name: string;
}

// If status is pending: start and end time are estimated
// If status is in process: start time is real time and end time is estimated
// If status is done: start and end time are real time of activities
export class ProductionStepModel {
  status: typeof PRODUCTION_STEP_STATUS[number];
  formula: FormulaResumeModel;
  step: StepDetailsModel;
  time?: TimeModel;
}

export class ProductionInProcessModel {
  time: Date;
  steps: Array<ProductionStepModel>;
}

// Time sorting steps
export class ProductionFormulaStepsModel {
  formula: FormulaResumeModel;
  steps: Array<ProductionStepModel>;
}

/* Storage production */
export class ProductionStorageModel {
  production: ProductionModel;
  production_in_process: ProductionInProcessModel;
  formulas: Array<FormulaPresentModel & { show: boolean }>;
}

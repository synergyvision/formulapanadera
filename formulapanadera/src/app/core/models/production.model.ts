import { FormulaModel } from "./formula.model";
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

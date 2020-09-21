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

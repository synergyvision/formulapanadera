import { FormulaModel } from "./formula.model";
import { IngredientModel } from "./ingredient.model";
import { ProductionModel } from "./production.model";
import { UserOwnerModel } from "./user.model";

export class CourseModel {
  name: string;
  description?: string;
  ingredients?: Array<IngredientModel>;
  formulas?: Array<FormulaModel>;
  productions?: Array<ProductionModel>;
  user: UserOwnerModel;
}
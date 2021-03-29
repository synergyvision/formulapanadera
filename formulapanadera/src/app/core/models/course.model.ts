import { FormulaModel } from "./formula.model";
import { IngredientModel } from "./ingredient.model";
import { ProductionModel } from "./production.model";
import { NoteModel } from "./shared.model";
import { UserGroupModel, UserOwnerModel } from "./user.model";

export class OrderedItemModel {
  order: number;
  item: IngredientModel | FormulaModel | ProductionModel;
}

export class CourseModel {
  id: string;
  name: string;
  description?: string;
  notes?: Array<NoteModel>;
  ingredients?: Array<OrderedItemModel>;
  formulas?: Array<OrderedItemModel>;
  productions?: Array<OrderedItemModel>;
  user: UserOwnerModel & { shared_groups: UserGroupModel[]};
}
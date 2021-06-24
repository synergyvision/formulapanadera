import { CourseModel } from "../models/course.model";
import { FormulaModel } from "../models/formula.model";
import { IngredientModel } from "../models/ingredient.model";
import { ProductionModel } from "../models/production.model";

export interface FirebaseService {
  create: (data: IngredientModel | FormulaModel | ProductionModel | CourseModel) => Promise<void>;
  update: (data: IngredientModel | FormulaModel | ProductionModel | CourseModel, originalData: IngredientModel | FormulaModel | ProductionModel | CourseModel) => Promise<void>;
  delete: (data: IngredientModel | FormulaModel | ProductionModel | CourseModel) => Promise<void>;
}
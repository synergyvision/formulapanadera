import { IngredientModel } from "./ingredient.model";

export class IngredientPercentageModel {
  ingredient: IngredientModel;
  percentage: number;
}

export class IngredientMixingModel {
  ingredients: Array<IngredientPercentageModel>;
  description: string;
}

export class StepDetailsModel {
  number: number;
  name: string;
  time: number; // minutes
  temperature?: {
    // single or range
    min: number;
    max: number;
  };
  ingredients?: Array<IngredientPercentageModel>;
  description: string;
}

export class FormulaModel {
  id: string;
  name: string;
  shared: boolean; // recipe was shared by another user
  units: number; // number of breads on the recipe
  unit_weight: number; // weight of one bread
  ingredients: Array<IngredientPercentageModel>;
  steps: Array<StepDetailsModel>;
  mixing: Array<IngredientMixingModel>;
  useremail: string; // creator
}

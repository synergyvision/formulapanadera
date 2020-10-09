import { PROPORTION_FACTOR } from "src/app/config/formula";

import {
  IngredientPercentageModel,
  IngredientMixingModel,
} from "./formula.model";

export type ProportionFactor = {
  factor: typeof PROPORTION_FACTOR[number];
  ingredient?: { id: string; name: string };
};

export class IngredientModel {
  id: string;
  name: string;
  is_flour: boolean;
  hydration: number;
  cost: number;
  can_be_modified: boolean;
  creator: string;
  formula?: {
    // if the ingredient has its own formula
    ingredients: Array<IngredientPercentageModel>;
    mixing: Array<IngredientMixingModel>;
    compensation_percentage: number;
    proportion_factor: ProportionFactor;
    suggested_values: {
      min: number;
      max: number;
    };
  };
}

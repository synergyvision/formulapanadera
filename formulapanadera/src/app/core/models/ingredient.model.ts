import {
  IngredientPercentageModel,
  IngredientMixingModel,
} from "./formula.model";

export const proportion_factor = ["flour", "dough"] as const;
export type ProportionFactor = typeof proportion_factor[number];

export class IngredientModel {
  id: string;
  name: string;
  is_flour: boolean;
  hydration: number;
  cost: number;
  can_be_deleted: boolean;
  formula?: { // if the ingredient has its own formula
    ingredients: Array<IngredientPercentageModel>;
    mixing: Array<IngredientMixingModel>;
    compensation_percentage: number;
    proportion_factor: ProportionFactor;
  };
}

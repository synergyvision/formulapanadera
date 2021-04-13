import { PROPORTION_FACTOR } from "src/app/config/formula";

import {
  IngredientPercentageModel,
  IngredientMixingModel,
} from "./formula.model";
import { ReferenceModel } from "./shared.model";
import { UserOwnerModel } from "./user.model";

export type ProportionFactor = {
  factor: typeof PROPORTION_FACTOR[number];
  ingredient?: { id: string; name: string };
};

export class IngredientModel {
  id: string;
  name: string;
  is_flour: boolean;
  hydration: number;
  fat: number;
  cost: number;
  references: Array<ReferenceModel>;
  formula?: {
    // if the ingredient has its own formula
    ingredients: Array<IngredientPercentageModel>;
    mixing?: Array<IngredientMixingModel>;
    compensation_percentage: number;
    proportion_factor: ProportionFactor;
    suggested_values: {
      min: number;
      max: number;
    };
  };
  user: UserOwnerModel;
}

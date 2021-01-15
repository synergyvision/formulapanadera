import { IngredientModel } from "./ingredient.model";
import { ModifierModel, UserResumeModel } from "./user.model";
import { ReferenceModel } from "./shared.model"

export class IngredientPercentageModel {
  ingredient: IngredientModel;
  percentage: number;
}

export class IngredientMixingModel {
  ingredients: Array<IngredientPercentageModel>;
  description: string;
}

export class FormulaMixingModel {
  name: string;
  description: string;
  mixing_order: Array<IngredientMixingModel>
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
  // If step gets repeated, works with manipulation step
  times?: number;
}

export class BasicCharacteristicsModel {
  aroma: string;
  texture: string;
  color: string;
  flavor: string;
}

export class OrganolepticCharacteristicsModel {
  overview: string;
  shape: string;
  weight: string;
  cell_size: string;
  bubbles_presence: string;
  useful_life: string;
  crumb: BasicCharacteristicsModel;
  crust: BasicCharacteristicsModel & { hardness: string; };
}

export class FormulaModel {
  id: string;
  name: string;
  units: number; // number of breads on the recipe
  unit_weight: number; // weight of one bread
  description?: string;
  organoleptic_characteristics?: OrganolepticCharacteristicsModel;
  references?: Array<ReferenceModel>;
  ingredients: Array<IngredientPercentageModel>;
  steps: Array<StepDetailsModel>;
  mixing: Array<FormulaMixingModel>;
  user: {
    // If empty formula is public
    owner: string;
    // Used to clone
    can_clone: boolean;
    cloned: boolean;
    reference: string; // ID of original formula
    shared_users: Array<UserResumeModel>;
    // Used to credit the users
    creator: ModifierModel;
    modifiers: Array<ModifierModel>;
  };
}

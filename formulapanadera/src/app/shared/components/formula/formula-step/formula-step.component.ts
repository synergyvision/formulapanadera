import { Component, Input } from "@angular/core";
import { ASSETS } from 'src/app/config/assets';
import { MANIPULATION_STEP } from 'src/app/config/formula';
import { ICONS } from "src/app/config/icons";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-step",
  templateUrl: "./formula-step.component.html",
  styleUrls: ["./styles/formula-step.component.scss"],
})
export class FormulaStepComponent {
  ICONS = ICONS;

  @Input() step: StepDetailsModel;
  @Input() index: number;
  @Input() even: boolean;
  @Input() details: boolean = false;
  @Input() ingredients_formula: Array<any> = [];
  @Input() units?: number;
  @Input() total_weight?: number;
  showIngredients: boolean = false;
  showMixing: boolean = false;

  constructor(private formatNumberService: FormatNumberService) {}

  getStepAsset() {
    return ASSETS.step[this.index];
  }

  fahrenheitTemperature(value) {
    value = this.formatNumberService.fromCelsiusToFahrenheit(value);
    return value;
  }

  isManipulationStep(): boolean {
    return this.step.number == MANIPULATION_STEP-1
  }

  getStepCompoundIngredients() {
    let compound_ingredients = []
    this.step.ingredients.forEach(ingredient => {
      if (ingredient.ingredient.formula) {
        this.ingredients_formula.forEach(ingredient_formula => {
          if (ingredient.ingredient.id == ingredient_formula.ingredient.id) {
            compound_ingredients.push(ingredient_formula)
          }
        })
      }
    });
    return compound_ingredients;
  }

  stepHasMixing() {
    let has_mixing = false
    let compound_ingredients = this.getStepCompoundIngredients()
    if (this.getStepCompoundIngredients()) {
      compound_ingredients.forEach(ingredient => {
        if (ingredient.ingredient.formula.mixing) {
          has_mixing = true
        }
      })
    }
    return has_mixing
  }
}

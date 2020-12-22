import { Component, Input } from "@angular/core";
import { ASSETS } from 'src/app/config/assets';
import { CURRENCY } from "src/app/config/configuration";
import { DECIMAL_COST_FORMAT, DECIMALS } from 'src/app/config/formats';
import { ICONS } from "src/app/config/icons";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { IngredientModel } from "src/app/core/models/ingredient.model";

@Component({
  selector: "app-ingredient-item",
  templateUrl: "./ingredient-item.component.html",
  styleUrls: ["./styles/ingredient-item.component.scss"],
})
export class IngredientItemComponent {
  @Input() ingredient: IngredientModel;
  @Input() clickable: boolean = false;
  @Input() even: boolean = false;
  @Input() selected: boolean = false;

  currency = CURRENCY;
  ICONS = ICONS;
  ASSETS = ASSETS
  INGREDIENT_COST_FORMAT = DECIMAL_COST_FORMAT.ingredient

  constructor() { }

  formulaTotalPercentage(ingredients: IngredientPercentageModel[]) {
    let percentage = 0
    ingredients.forEach(ingredient => {
      percentage = Number(ingredient.percentage) + percentage
    })
    return percentage
  }

  formulaTotalHydration(ingredients: IngredientPercentageModel[]) {
    let hydration = 0
    ingredients.forEach(ingredient => {
      if (ingredient.ingredient.hydration && !ingredient.ingredient.formula) {
        hydration = Number(ingredient.ingredient.hydration) + hydration
      }
    })
    return hydration
  }
  
  ingredientHydration() {
    let hydration: number = this.ingredient.hydration;
    if (this.ingredient.formula) {
      this.ingredient.formula.ingredients.forEach(ingredient => {
        if (ingredient.ingredient.formula) {
          hydration =
            Number((hydration +
            (this.ingredient.hydration * (ingredient.percentage / 100)) *
            (this.formulaTotalHydration(ingredient.ingredient.formula.ingredients)/this.formulaTotalPercentage(ingredient.ingredient.formula.ingredients))).toFixed(DECIMALS.hydration))
        }
      })
    }
    return hydration
  }
}

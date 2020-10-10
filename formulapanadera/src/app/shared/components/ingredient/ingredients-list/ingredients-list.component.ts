import { Component, Input } from "@angular/core";
import { DECIMALS } from "src/app/config/formats";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-ingredients-list",
  templateUrl: "./ingredients-list.component.html",
  styleUrls: ["./styles/ingredients-list.component.scss"],
})
export class IngredientsListComponent {
  @Input() ingredients: Array<IngredientPercentageModel>;
  @Input() bakers_percentage: number;
  @Input() compensation?: number;
  @Input() name?: string;

  constructor(private formatNumberService: FormatNumberService) {}

  ingredientGrams(percentage: number): string {
    if (!this.compensation) {
      return this.formatNumberService.formatNumberDecimals(
        percentage * this.bakers_percentage,
        DECIMALS.formula_grams
      );
    } else {
      return this.formatNumberService.formatNumberDecimals(
        percentage * this.bakers_percentage * (1 + this.compensation / 100),
        DECIMALS.formula_grams
      );
    }
  }

  totalPercentage() {
    let total: number = 0;
    this.ingredients.forEach((ingredient) => {
      total = total + ingredient.percentage;
    });
    return total;
  }

  totalGrams() {
    let total: number = 0;
    this.ingredients.forEach((ingredient) => {
      total = total + Number(this.ingredientGrams(ingredient.percentage));
    });
    return total;
  }
}

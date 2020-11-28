import { Component, Input, OnInit } from "@angular/core";
import { DECIMALS } from "src/app/config/formats";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-ingredients-list",
  templateUrl: "./ingredients-list.component.html",
  styleUrls: ["./styles/ingredients-list.component.scss"],
})
export class IngredientsListComponent implements OnInit{
  @Input() ingredients: Array<IngredientPercentageModel>;
  @Input() bakers_percentage: number;
  @Input() compensation?: number;
  @Input() name?: string;
  @Input() units?: number;

  constructor(private formatNumberService: FormatNumberService) {}

  ngOnInit() {
    if (this.units && this.units <= 1) {
      this.units = undefined
    }
  }

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

  unitGrams(ingredientGrams: number) {
    return this.formatNumberService.formatNumberDecimals(
      ingredientGrams / this.units,
      DECIMALS.formula_grams
    );
  }

  totalPercentage() {
    let total: number = 0;
    this.ingredients.forEach((ingredient) => {
      total = total + ingredient.percentage;
    });
    return total.toFixed(DECIMALS.formula_percentage);
  }

  totalGrams() {
    let total: number = 0;
    this.ingredients.forEach((ingredient) => {
      total = total + Number(this.ingredientGrams(ingredient.percentage));
    });
    return total.toFixed(DECIMALS.formula_grams);
  }

  unitTotalGrams(totalGrams: number) {
    return this.formatNumberService.formatNumberDecimals(
      totalGrams / this.units,
      DECIMALS.formula_grams
    );
  }
}

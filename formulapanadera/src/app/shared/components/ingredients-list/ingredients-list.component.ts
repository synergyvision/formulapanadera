import { Component, Input } from "@angular/core";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-ingredients-list",
  templateUrl: "./ingredients-list.component.html",
  styleUrls: ["./styles/ingredients-list.component.scss"],
})
export class IngredientsListComponent {
  @Input() ingredients: Array<IngredientPercentageModel>;
  @Input() bakers_percentage: number;
  @Input() total_weight?: number;
  @Input() compensation?: number;
  @Input() name?: string;

  constructor() {}

  ingredientGrams(percentage: number): string {
    if (!this.compensation) {
      return (percentage * this.bakers_percentage).toFixed(2);
    } else {
      return (
        percentage *
        this.bakers_percentage *
        (1 + this.compensation / 100)
      ).toFixed(2);
    }
  }
}

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

  constructor() {}

  ingredientGrams(percentage: number): string {
    return (percentage * this.bakers_percentage).toFixed(2);
  }
}

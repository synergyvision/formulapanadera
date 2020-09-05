import { Component, Input } from "@angular/core";
import { IngredientModel } from "src/app/core/models/ingredient.model";

@Component({
  selector: "app-ingredient-item",
  templateUrl: "./ingredient-item.component.html",
  styleUrls: ["./styles/ingredient-item.component.scss"],
})
export class IngredientItemComponent {
  @Input() ingredient: IngredientModel;
  @Input() clickable: boolean = false;

  constructor() {}
}

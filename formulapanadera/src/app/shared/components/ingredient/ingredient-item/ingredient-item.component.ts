import { Component, Input } from "@angular/core";
import { CURRENCY } from 'src/app/config/configuration';
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

  constructor() {}
}
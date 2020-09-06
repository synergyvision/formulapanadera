import { Component, Input } from "@angular/core";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-ingredient-item",
  templateUrl: "./ingredient-item.component.html",
  styleUrls: ["./styles/ingredient-item.component.scss"],
})
export class IngredientItemComponent {
  @Input() ingredient: IngredientModel;
  @Input() clickable: boolean = false;

  currency = environment.currency

  constructor() {}
}

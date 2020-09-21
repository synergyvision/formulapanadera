import { Component, Input, OnInit } from "@angular/core";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { FormulaPresentModel } from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";

@Component({
  selector: "app-production-ingredients-list",
  templateUrl: "./production-ingredients.component.html",
  styleUrls: ["./styles/production-ingredients.component.scss"],
})
export class ProductionIngredientsComponent implements OnInit {
  @Input() formulas: Array<FormulaPresentModel>;

  ingredients: Array<IngredientPercentageModel>;

  constructor(private productionService: ProductionService) {}

  ngOnInit() {
    this.ingredients = this.productionService.calculateTotalIngredients(
      this.formulas
    );
  }
}

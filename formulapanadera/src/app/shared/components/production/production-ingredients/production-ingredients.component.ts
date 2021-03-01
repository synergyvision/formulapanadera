import { Component, Input, OnInit } from "@angular/core";
import { DECIMALS } from "src/app/config/formats";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { FormulaPresentModel } from "src/app/core/models/production.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { ProductionService } from "src/app/core/services/production.service";

@Component({
  selector: "app-production-ingredients-list",
  templateUrl: "./production-ingredients.component.html",
  styleUrls: ["./styles/production-ingredients.component.scss"],
})
export class ProductionIngredientsComponent implements OnInit {
  @Input() formulas: Array<FormulaPresentModel>;

  ingredients: Array<IngredientPercentageModel>;

  constructor(
    private productionService: ProductionService,
    private formatNumberService: FormatNumberService,
    private formulaService: FormulaService
  ) {}

  ngOnInit() {
    this.ingredients = this.productionService.calculateTotalIngredients(
      this.formulas
    );
    this.ingredients = this.formulaService.sortIngredients(this.ingredients);
  }

  parseNumberGrams(number: number) {
    return this.formatNumberService.formatNumberDecimals(
      number,
      DECIMALS.formula_grams
    );
  }
}

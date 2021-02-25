import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { DECIMALS } from "src/app/config/formats";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { FormulaService } from "src/app/core/services/formula.service";

@Component({
  selector: "app-ingredients-list",
  templateUrl: "./ingredients-list.component.html",
  styleUrls: ["./styles/ingredients-list.component.scss"],
})
export class IngredientsListComponent implements OnInit, OnChanges {
  @Input() ingredients: Array<IngredientPercentageModel>;
  @Input() bakers_percentage: number;
  @Input() compensation?: number;
  @Input() name?: string;
  @Input() units?: number;
  @Input() formula_weight?: number;
  @Input() compound_ingredient: boolean = false;

  constructor(
    private formatNumberService: FormatNumberService,
    private formulaService: FormulaService
  ) { }

  ngOnInit() {
    this.ingredients = this.formulaService.sortIngredients(this.ingredients);
    if (this.units && this.units <= 1 || !(this.gramsTable())) {
      this.units = undefined
    }
  }

  ngOnChanges() {
    if (this.units && this.units <= 1 || !(this.gramsTable())) {
      this.units = undefined
    }
  }

  ingredientGrams(percentage: number): string {
    if (!this.compensation) {
      if (this.bakers_percentage) {
        return this.formatNumberService.formatNumberDecimals(
          percentage * this.bakers_percentage,
          DECIMALS.formula_grams
        );
      } else { 
        return this.formatNumberService.formatNumberDecimals(
          percentage * this.formula_weight/100,
          DECIMALS.formula_grams
        );
      }
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

  noCompoundIngredients() {
    let compound: boolean = false;
    this.ingredients.forEach(ingredient => {
      if (ingredient.ingredient.formula) {
        compound = true
      }
    })
    if (this.bakers_percentage) {
      compound = false;
    }
    return !compound;
  }

  gramsTable() {
    return (this.bakers_percentage || this.noCompoundIngredients()) && !this.compound_ingredient
  }
}

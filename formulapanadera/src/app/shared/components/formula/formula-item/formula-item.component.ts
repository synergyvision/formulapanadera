import { Component, Input } from "@angular/core";
import { FormulaModel } from "../../../../core/models/formula.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { DECIMAL_COST_FORMAT } from "src/app/config/formats";

@Component({
  selector: "app-formula-item",
  templateUrl: "./formula-item.component.html",
  styleUrls: ["./styles/formula-item.component.scss"],
})
export class FormulaItemComponent {
  @Input() formula: FormulaModel;
  @Input() clickable: boolean = false;
  @Input() even: boolean = false;
  @Input() selected: boolean = false;

  currency = CURRENCY;
  ICONS = ICONS;
  FORMULA_COST_FORMAT = DECIMAL_COST_FORMAT.formula;

  constructor(private formulaService: FormulaService) {}

  hydration() {
    let formula: FormulaModel = JSON.parse(JSON.stringify(this.formula))
    let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(formula))
    formula_without_compound.ingredients.forEach((ingredient, index) => {
      if (ingredient.ingredient.formula) {
        formula_without_compound.ingredients.splice(
          index,
          1
        );
      }
    })
    this.formulaService.deleteIngredientsWithFormula(formula, formula_without_compound)
    return this.formulaService.calculateHydration(formula_without_compound.ingredients);
  }

  unitCost() {
    let bakers_percentage = this.formulaService.calculateBakersPercentage(
      this.formula.units * this.formula.unit_weight,
      this.formula.ingredients
    );
    let total_cost = this.formulaService.calculateTotalCost(
      this.formula.ingredients,
      Number(bakers_percentage)
    );
    return (Number(total_cost) / this.formula.units).toString();
  }
}

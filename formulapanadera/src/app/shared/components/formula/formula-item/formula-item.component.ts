import { Component, Input } from "@angular/core";
import { FormulaModel } from "../../../../core/models/formula.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { DECIMALS, DECIMAL_COST_FORMAT } from "src/app/config/formats";

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
    let formula_without_compound: FormulaModel = this.formulaService.getFormulaWithoutCompoundIngredients(this.formula).formula;
    return this.formulaService.calculateHydration(formula_without_compound.ingredients);
  }

  fat() {
    let formula_without_compound: FormulaModel = this.formulaService.getFormulaWithoutCompoundIngredients(this.formula).formula;
    return this.formulaService.calculateFat(formula_without_compound.ingredients);
  }

  unitCost(): number {
    let formula_without_compound = this.formulaService.getFormulaWithoutCompoundIngredients(this.formula)
    let bakers_percentage = formula_without_compound.bakers_percentage
    let total_cost = this.formulaService.calculateTotalCost(
      formula_without_compound.formula.ingredients,
      Number(bakers_percentage)
    );
    return Number(total_cost) / this.formula.units;
  }
}

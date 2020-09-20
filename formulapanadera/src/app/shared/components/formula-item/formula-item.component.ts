import { Component, Input } from "@angular/core";
import { FormulaModel } from "../../../core/models/formula.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { environment } from "src/environments/environment";
import { CURRENCY } from "src/app/config/units";
import { DECIMALS } from "src/app/config/formats";

@Component({
  selector: "app-formula-item",
  templateUrl: "./formula-item.component.html",
  styleUrls: ["./styles/formula-item.component.scss"],
})
export class FormulaItemComponent {
  @Input() formula: FormulaModel;
  @Input() type: string;
  @Input() clickable: boolean = false;
  @Input() even: boolean = false;

  currency = CURRENCY;

  constructor(private formulaService: FormulaService) {}

  hydration() {
    return this.formulaService.calculateHydration(this.formula.ingredients);
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
    return (Number(total_cost) / this.formula.units).toFixed(DECIMALS.cost);
  }
}

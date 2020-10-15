import { Component, Input } from "@angular/core";
import { CURRENCY } from "src/app/config/configuration";
import { DECIMAL_COST_FORMAT } from 'src/app/config/formats';
import { FormulaPresentModel } from "src/app/core/models/production.model";
import { FormulaService } from 'src/app/core/services/formula.service';
import { ProductionService } from "src/app/core/services/production.service";

@Component({
  selector: "app-formulas-list",
  templateUrl: "./formulas-list.component.html",
  styleUrls: ["./styles/formulas-list.component.scss"],
})
export class FormulasListComponent {
  CURRENCY = CURRENCY;
  FORMULA_COST_FORMAT = DECIMAL_COST_FORMAT.formula

  @Input() formulas: Array<FormulaPresentModel>;

  constructor(private productionService: ProductionService, private formulaService: FormulaService) {}

  totalUnits(): number {
    return this.productionService.calculateTotalUnits(this.formulas);
  }

  totalCost(): number {
    return this.productionService.calculateTotalCost(this.formulas);
  }

  timeBeforeOven(formula: FormulaPresentModel): number{
    return this.formulaService.calculateTimeBeforeOven(formula.formula.steps)
  }
}

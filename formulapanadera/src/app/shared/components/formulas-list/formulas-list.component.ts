import { Component, Input } from "@angular/core";
import { CURRENCY } from "src/app/config/configuration";
import { FormulaPresentModel } from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";

@Component({
  selector: "app-formulas-list",
  templateUrl: "./formulas-list.component.html",
  styleUrls: ["./styles/formulas-list.component.scss"],
})
export class FormulasListComponent {
  CURRENCY = CURRENCY;

  @Input() formulas: Array<FormulaPresentModel>;

  constructor(private productionService: ProductionService) {}

  totalUnits(): number {
    return this.productionService.calculateTotalUnits(this.formulas);
  }

  totalCost(): number {
    return this.productionService.calculateTotalCost(this.formulas);
  }
}

import { Component, Input } from "@angular/core";
import { FormulaPresentModel } from "src/app/core/models/production.model";
import { FormulaService } from "src/app/core/services/formula.service";

@Component({
  selector: "app-formula-time-table",
  templateUrl: "./formula-time-table.component.html",
  styleUrls: ["./styles/formula-time-table.component.scss"],
})
export class FormulaTimeTableComponent {
  @Input() formula: FormulaPresentModel;

  constructor(private formulaService: FormulaService) {}

  totalTime() {
    return this.formulaService.calculateTime(this.formula.formula.steps);
  }
}

import { Component, Input } from "@angular/core";
import { DECIMAL_HOUR_FORMAT } from 'src/app/config/formats';
import { FormulaModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from 'src/app/core/services/format-number.service';
import { FormulaService } from "src/app/core/services/formula.service";

@Component({
  selector: "app-formula-time-table",
  templateUrl: "./formula-time-table.component.html",
  styleUrls: ["./styles/formula-time-table.component.scss"],
})
export class FormulaTimeTableComponent {
  @Input() formula: FormulaModel;
  DECIMAL_HOUR_FORMAT = DECIMAL_HOUR_FORMAT

  constructor(private formulaService: FormulaService, private formatNumberService: FormatNumberService) {}

  totalTime() {
    return this.formulaService.calculateTime(this.formula.steps);
  }

  fromMinutesToHours(minutes: number) {
    return this.formatNumberService.fromMinutesToHours(minutes)
  }
}

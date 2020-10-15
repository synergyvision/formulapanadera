import { Component, Input } from "@angular/core";
import { FormulaModel } from "src/app/core/models/formula.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { TimeService } from 'src/app/core/services/time.service';

@Component({
  selector: "app-formula-time-table",
  templateUrl: "./formula-time-table.component.html",
  styleUrls: ["./styles/formula-time-table.component.scss"],
})
export class FormulaTimeTableComponent {
  @Input() formula: FormulaModel;

  constructor(private formulaService: FormulaService, private timeService: TimeService) {}

  totalTime() {
    return this.formulaService.calculateTime(this.formula.steps);
  }

  getSpecificTime(minutes: number, type: "h" | "m") {
    let time = this.timeService.fromMinutesToHours(minutes)
    if (type == "h") {
      return time.hours
    } else if (type == "m") {
      return time.minutes
    }
  }
}

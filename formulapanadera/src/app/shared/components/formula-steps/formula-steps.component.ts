import { Component, Input } from "@angular/core";
import { StepDetailsModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-formula-steps",
  templateUrl: "./formula-steps.component.html",
  styleUrls: [
    "./styles/formula-steps.component.scss",
    "../../styles/note.alert.scss",
  ],
})
export class FormulaStepsComponent {
  @Input() steps: Array<StepDetailsModel>;
  @Input() temperatureUnit: string;

  constructor() {}
}

import { Component, Input } from "@angular/core";
import { StepDetailsModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-formula-step",
  templateUrl: "./formula-step.component.html",
  styleUrls: [
    "./styles/formula-step.component.scss",
    "../../styles/note.alert.scss",
  ],
})
export class FormulaStepComponent {
  @Input() step: Array<StepDetailsModel>;
  @Input() temperatureUnit: string;

  constructor() {}
}

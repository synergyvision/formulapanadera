import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { StepDetailsModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-formula-step",
  templateUrl: "./formula-step.component.html",
  styleUrls: ["./styles/formula-step.component.scss"],
})
export class FormulaStepComponent {
  ICONS = ICONS;

  @Input() step: StepDetailsModel;
  @Input() temperatureUnit: string;
  @Input() details: boolean = false;

  constructor() {}
}

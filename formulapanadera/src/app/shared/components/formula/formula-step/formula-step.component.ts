import { Component, Input } from "@angular/core";
import { ASSETS } from 'src/app/config/assets';
import { MANIPULATION_STEP } from 'src/app/config/formula';
import { ICONS } from "src/app/config/icons";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-step",
  templateUrl: "./formula-step.component.html",
  styleUrls: ["./styles/formula-step.component.scss"],
})
export class FormulaStepComponent {
  ICONS = ICONS;

  @Input() step: StepDetailsModel;
  @Input() index: number;
  @Input() even: boolean;

  constructor(private formatNumberService: FormatNumberService) {}

  getStepAsset() {
    return ASSETS.step[this.index];
  }

  fahrenheitTemperature(value) {
    value = this.formatNumberService.fromCelsiusToFahrenheit(value);
    return value;
  }

  isManipulationStep(): boolean {
    return this.step.number == MANIPULATION_STEP-1
  }
}

import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-step-details",
  templateUrl: "./formula-step-details.component.html",
  styleUrls: ["./styles/formula-step-details.component.scss"],
})
export class FormulaStepDetailsComponent {
  ICONS = ICONS;

  @Input() step: StepDetailsModel;
  @Input() details: boolean = false;
  @Input() temperatureUnit: string = "C";
  @Input() read: boolean = true;

  constructor(private formatNumberService: FormatNumberService) {}

  fahrenheitTemperature(value) {
    value = this.formatNumberService.fromCelsiusToFahrenheit(value);
    return value;
  }
}

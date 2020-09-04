import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { FormGroup } from "@angular/forms";

@Component({
  selector: "app-formula-steps",
  templateUrl: "formula-steps.modal.html",
  styleUrls: ["./styles/formula-steps.modal.scss"],
})
export class FormulaStepsModal {
  @Input() formulaSteps: Array<StepDetailsModel>;

  stepsForm: FormGroup = new FormGroup({});

  temperatureUnit: string = "C";

  constructor(
    public modalController: ModalController,
    private formatNumberService: FormatNumberService
  ) {}

  dismissModal() {
    this.modalController.dismiss();
  }

  saveSteps() {
    this.modalController.dismiss({
      steps: this.formulaSteps,
      temperatureUnit: this.temperatureUnit,
    });
  }

  changeTemperatureOption(event: any, step: StepDetailsModel) {
    if (event.detail.value == "no") {
      this.formulaSteps[this.formulaSteps.indexOf(step)].temperature = null;
    } else if (event.detail.value == "yes") {
      this.formulaSteps[this.formulaSteps.indexOf(step)].temperature = {
        min: 1,
        max: undefined,
      };
    } else if (event.detail.value == "range") {
      this.formulaSteps[this.formulaSteps.indexOf(step)].temperature = {
        min: 1,
        max: 2,
      };
    }
  }

  formatTemperature(type: string, step: StepDetailsModel) {
    let index = this.formulaSteps.indexOf(step);
    let min = this.formulaSteps[index].temperature.min;
    let max = this.formulaSteps[index].temperature.max;
    if (type == "min") {
      this.formulaSteps[index].temperature.min = Number(
        this.formatNumberService.formatNumberDecimals(min, 0)
      );
    } else {
      this.formulaSteps[index].temperature.max = Number(
        this.formatNumberService.formatNumberDecimals(max, 0)
      );
    }
  }

  formatTime(step: StepDetailsModel) {
    let index = this.formulaSteps.indexOf(step);
    this.formulaSteps[index].time = Number(
      this.formatNumberService.formatNonZeroPositiveNumber(
        this.formulaSteps[index].time
      )
    );
  }
}

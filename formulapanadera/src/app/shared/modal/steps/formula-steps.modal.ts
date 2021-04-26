import { AfterViewInit, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { IonTextarea, ModalController } from "@ionic/angular";
import { MANIPULATION_STEP } from "src/app/config/formula";
import { ICONS } from "src/app/config/icons";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-steps-modal",
  templateUrl: "formula-steps.modal.html",
  styleUrls: ["./styles/formula-steps.modal.scss"],
})
export class FormulaStepsModal implements AfterViewInit {
  ICONS = ICONS;
  MANIPULATION_STEP = MANIPULATION_STEP;

  @ViewChildren("stepdescription") private textAreas: QueryList<IonTextarea>
  @Input() formulaSteps: Array<StepDetailsModel>;

  temperatureUnit: string = "C";

  constructor(
    public modalController: ModalController,
    private formatNumberService: FormatNumberService
  ) { }
  
  ngAfterViewInit() {
    this.textAreas.toArray().forEach(textArea => {
      textArea.autoGrow = true;
      textArea.ionChange.subscribe(() => {
        textArea.autoGrow = true;
      })
    })
  }

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
        min: 26,
        max: -1,
      };
    } else if (event.detail.value == "range") {
      this.formulaSteps[this.formulaSteps.indexOf(step)].temperature = {
        min: 25,
        max: 27,
      };
    }
  }

  selectValue(step: StepDetailsModel) {
    if (step.temperature === null) {
      return "no";
    } else if (step.temperature.max == -1) {
      return "yes";
    } else {
      return "range";
    }
  }

  formatTemperature(type: string, step: StepDetailsModel) {
    let index = this.formulaSteps.indexOf(step);
    let min = this.formulaSteps[index].temperature.min;
    let max = this.formulaSteps[index].temperature.max;
    if (type == "min") {
      this.formulaSteps[index].temperature.min = Number(
        this.formatNumberService.formatNonZeroPositiveNumber(min)
      );
    } else {
      this.formulaSteps[index].temperature.max = Number(
        this.formatNumberService.formatNonZeroPositiveNumber(max)
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

  formatManipulationTimes(step: StepDetailsModel) {
    let index = this.formulaSteps.indexOf(step);
    this.formulaSteps[index].times = Number(
      this.formatNumberService.formatNonZeroPositiveNumber(
        this.formulaSteps[index].times
      )
    );
  }

  stepsAreValid(): boolean {
    let valid = false;
    this.formulaSteps.forEach(step => {
      if (step.time > 0) {
        valid = true;
      }
    })
    return valid;
  }

  //Change
  changeTemperature(event: any) {
    this.temperatureUnit = event.detail.value;
  }
}

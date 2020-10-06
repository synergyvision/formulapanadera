import { Component, Input } from "@angular/core";
import { AlertController } from "@ionic/angular";
import {
  FERMENTATION_STEP,
  MANIPULATION_STEP,
  OVEN_STEP,
} from "src/app/config/formula";
import { ICONS } from "src/app/config/icons";
import {
  ProductionInProcessModel,
  ProductionStepModel,
} from "src/app/core/models/production.model";
import { LanguageService } from "src/app/core/services/language.service";
import { ProductionInProcessService } from "src/app/core/services/production-in-process.service";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-production-step-item",
  templateUrl: "./production-step-item.component.html",
  styleUrls: [
    "./styles/production-step-item.component.scss",
    "./../../../styles/confirm.alert.scss",
  ],
})
export class ProductionStepItemComponent {
  ICONS = ICONS;
  OVEN_STEP = OVEN_STEP - 1;
  FERMENTATION_STEP = FERMENTATION_STEP - 1;

  @Input() step: ProductionStepModel;
  @Input() even: boolean = false;
  @Input() production_in_process: ProductionInProcessModel;
  @Input() original_production: ProductionInProcessModel;
  @Input() blocked: boolean = false;
  show_description: boolean = false;

  constructor(
    private timeService: TimeService,
    private productionInProcessService: ProductionInProcessService,
    private alertController: AlertController,
    private languageService: LanguageService
  ) {}

  formatTime(date: Date) {
    return this.timeService.formatTime(date);
  }

  showDescription() {
    if (this.step.time) {
      this.show_description = !this.show_description;
    }
  }

  stepOnTime(): boolean {
    let on_time: boolean = true;
    if (this.step.time && this.step.status !== "DONE") {
      if (this.step.status == "PENDING") {
        on_time = this.timeService.dateIsSameOrAfterNow(this.step.time.start);
      } else if (this.step.status == "IN PROCESS") {
        on_time = this.timeService.dateIsSameOrAfterNow(this.step.time.end);
      }
    }
    return on_time;
  }

  stepProgress() {
    let progress: number = 100;
    if (this.step.time && this.step.status !== "DONE") {
      if (this.step.status == "PENDING") {
        progress = 0;
      } else if (this.step.status == "IN PROCESS") {
        let total = this.timeService.difference(
          this.step.time.start,
          this.step.time.end
        );
        let current = this.timeService.differenceWithNow(this.step.time.start);
        progress = Number(((current * 100) / total).toFixed(1));
      }
    }
    return progress;
  }

  stepIcon(step: ProductionStepModel): string {
    if (step.status == "PENDING") {
      return ICONS.play;
    } else if (step.status == "IN PROCESS") {
      return ICONS.check;
    } else {
      return ICONS.done;
    }
  }

  productionStarted(): boolean {
    return this.productionInProcessService.productionStarted(
      this.production_in_process.steps
    );
  }

  changeStepStatus(step: ProductionStepModel): void {
    if (!this.blocked) {
      if (step.status == "PENDING") {
        if (step.step.number == 0 && !this.productionStarted()) {
          let difference = Number(
            this.timeService
              .difference(
                step.time.start,
                this.production_in_process.steps[0].time.start
              )
              .toFixed(0)
          );
          if (difference !== 0) {
            this.startFormulaAlert(step);
          } else {
            this.productionInProcessService.recalculateProduction(
              this.production_in_process,
              this.step
            );
            step.status = "IN PROCESS";
          }
        } else {
          this.productionInProcessService.recalculateProduction(
            this.production_in_process,
            this.step
          );
          step.status = "IN PROCESS";
        }
      } else if (step.status == "IN PROCESS") {
        this.productionInProcessService.recalculateProduction(
          this.production_in_process,
          this.step
        );
        step.status = "DONE";
        if (step.step.number == FERMENTATION_STEP - 1) {
          this.production_in_process.steps.forEach((production_step) => {
            if (
              step.formula.id == production_step.formula.id &&
              production_step.step.number == MANIPULATION_STEP - 1
            ) {
              production_step.status = "DONE";
            }
          });
        }
      }

      this.productionInProcessService.setProductionInProcess(
        this.production_in_process
      );
    }
  }

  async startFormulaAlert(step: ProductionStepModel) {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("production.warning.name"),
      message: this.languageService.getTerm("production.warning.start"),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.productionInProcessService.orderProduction(
              JSON.parse(JSON.stringify(this.original_production)),
              step.formula.id
            );
          },
        },
      ],
    });
    await alert.present();
  }
}

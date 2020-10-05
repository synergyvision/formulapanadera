import { Component, Input } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";
import {
  ProductionInProcessModel,
  ProductionStepModel,
} from "src/app/core/models/production.model";
import { LanguageService } from "src/app/core/services/language.service";
import { ProductionInProcessService } from "src/app/core/services/production-in-process.service";
import { ProductionService } from "src/app/core/services/production.service";
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

  @Input() step: ProductionStepModel;
  @Input() even: boolean = false;
  @Input() temperatureUnit: string = "C";
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
      this.productionInProcessService.recalculateProduction(
        this.production_in_process,
        this.step
      );
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
            step.status = "IN PROCESS";
          }
        } else {
          step.status = "IN PROCESS";
        }
      } else if (step.status == "IN PROCESS") {
        step.status = "DONE";
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
            console.log(this.original_production);
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

import { Component, Input } from "@angular/core";
import { ICONS } from "src/app/config/icons";
import { ProductionStepModel } from "src/app/core/models/production.model";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-production-step-item",
  templateUrl: "./production-step-item.component.html",
  styleUrls: ["./styles/production-step-item.component.scss"],
})
export class ProductionStepItemComponent {
  ICONS = ICONS;

  @Input() step: ProductionStepModel;
  @Input() even: boolean = false;
  @Input() temperatureUnit: string = "C";
  show_description: boolean = false;

  constructor(private timeService: TimeService) {}

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
      this.timeService.getCurrentTime();
      on_time = this.timeService.dateIsAfterNow(this.step.time.end);
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

  changeStepStatus(step: ProductionStepModel): void {
    if (step.status == "PENDING") {
      step.status = "IN PROCESS";
    } else if (step.status == "IN PROCESS") {
      step.status = "DONE";
    }
  }
}

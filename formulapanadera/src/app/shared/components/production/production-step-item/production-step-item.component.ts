import { Component, Input } from "@angular/core";
import { ProductionStepModel } from "src/app/core/models/production.model";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-production-step-item",
  templateUrl: "./production-step-item.component.html",
  styleUrls: ["./styles/production-step-item.component.scss"],
})
export class ProductionStepItemComponent {
  @Input() step: ProductionStepModel;
  @Input() even: boolean = false;

  constructor(private timeService: TimeService) {}

  formatTime(date: Date) {
    return this.timeService.formatTime(date);
  }
}

import { Component, Input } from "@angular/core";
import { CURRENCY } from "src/app/config/configuration";
import { DECIMAL_COST_FORMAT } from "src/app/config/formats";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";

@Component({
  selector: "app-production-item",
  templateUrl: "./production-item.component.html",
  styleUrls: ["./styles/production-item.component.scss"],
})
export class ProductionItemComponent {
  @Input() production: ProductionModel;
  @Input() even: boolean = false;

  currency = CURRENCY;
  DECIMAL_COST_FORMAT = DECIMAL_COST_FORMAT;

  constructor(private productionService: ProductionService) {}

  totalCost() {
    return this.productionService.calculateProductionCost(this.production);
  }
}

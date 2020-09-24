import { Component, Input } from "@angular/core";
import { CURRENCY } from "src/app/config/configuration";
import { DECIMALS } from "src/app/config/formats";
import { ProductionModel } from "src/app/core/models/production.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
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

  constructor(
    private productionService: ProductionService,
    private formatNumberService: FormatNumberService
  ) {}

  totalCost() {
    return this.formatNumberService.formatNumberDecimals(
      this.productionService.calculateProductionCost(this.production),
      DECIMALS.cost
    );
  }
}

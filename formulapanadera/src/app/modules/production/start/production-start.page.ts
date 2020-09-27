import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { SPECIFIC_TIME_FORMAT } from "src/app/config/formats";
import { ICONS } from "src/app/config/icons";
import {
  FormulaPresentModel,
  ProductionInProcessModel,
  ProductionModel,
  ProductionStepModel,
} from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-production-start",
  templateUrl: "production-start.page.html",
  styleUrls: ["./styles/production-start.page.scss"],
})
export class ProductionStartPage implements OnInit {
  ICONS = ICONS;

  production: ProductionModel;
  production_in_process: ProductionInProcessModel;
  formulas: Array<FormulaPresentModel & { show: boolean }>;
  segment: string = "steps";
  in_process: boolean = false;

  state;

  constructor(
    private router: Router,
    private productionService: ProductionService,
    private timeService: TimeService
  ) {
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    this.production = JSON.parse(JSON.stringify(this.state.production));
    this.formulas = JSON.parse(JSON.stringify(this.state.formulas));
    this.production_in_process = this.productionService.getProductionSteps(
      this.production
    );
    this.timeService.startCurrentTime();
  }

  // Change

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  changeProcessStatus() {
    this.in_process = !this.in_process;

    if (this.in_process) {
      this.productionService.startProduction(
        this.production.formulas,
        this.production_in_process
      );
      this.production_in_process.steps = this.productionService.sortStepsByTime(
        this.production_in_process.steps
      );
    } else {
      this.production_in_process.time = null;
      this.production_in_process.steps.forEach((step) => {
        step.status = "PENDING";
        step.time = null;
      });
    }
  }

  // Get / Format

  currentTime(): string {
    return this.timeService.getCurrentTime();
  }

  productionStartTime(): string {
    return this.timeService.formatTime(
      this.production_in_process.time,
      SPECIFIC_TIME_FORMAT
    );
  }

  stepsFiltered(done: boolean): Array<ProductionStepModel> {
    let filtered: Array<ProductionStepModel> = [];
    this.production_in_process.steps.forEach((step) => {
      if (done && step.status == "DONE") {
        filtered.push(step);
      } else if (!done && step.status !== "DONE") {
        filtered.push(step);
      }
    });
    return filtered;
  }

  // Navigate

  productionDetails() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.details,
      {
        state: { production: this.production },
      }
    );
  }
}

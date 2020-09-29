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
import { ProductionInProcessStorageService } from "src/app/core/services/storage/production-in-process.service";
import { TimeService } from "src/app/core/services/time.service";

@Component({
  selector: "app-production-start",
  templateUrl: "production-start.page.html",
  styleUrls: ["./styles/production-start.page.scss"],
})
export class ProductionStartPage implements OnInit {
  ICONS = ICONS;

  production: ProductionModel = new ProductionModel();
  production_in_process: ProductionInProcessModel = new ProductionInProcessModel();
  formulas: Array<FormulaPresentModel & { show: boolean }> = [];
  segment: string = "steps";
  in_process: boolean = false;

  state;

  constructor(
    private router: Router,
    private productionService: ProductionService,
    private productionInProcessStorageService: ProductionInProcessStorageService,
    private timeService: TimeService
  ) {
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    this.production = JSON.parse(JSON.stringify(this.state.production));
    let existing_production = await this.productionInProcessStorageService.getProduction();

    if (
      existing_production &&
      existing_production.production.id == this.production.id
    ) {
      this.production = existing_production.production;
      this.formulas = existing_production.formulas;
      this.productionService.setProductionInProcess(
        existing_production.production_in_process
      );
      this.in_process = true;
    } else {
      this.formulas = JSON.parse(JSON.stringify(this.state.formulas));
      this.productionService.getProductionSteps(this.production);
    }

    this.productionService.getProductionInProcess().subscribe((value) => {
      this.production_in_process = value;
      if (this.in_process) {
        this.productionInProcessStorageService.setProduction({
          formulas: this.formulas,
          production: this.production,
          production_in_process: value,
        });
      }
      if (
        this.productionService.productionEnded(this.production_in_process.steps)
      ) {
        this.changeProcessStatus();
      }
    });
  }

  // Change

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

  async changeProcessStatus() {
    this.in_process = !this.in_process;

    if (this.in_process) {
      this.productionService.startProduction(this.production_in_process);
    } else {
      this.productionService.getProductionSteps(this.production);
      await this.productionInProcessStorageService.deleteProduction();
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
    if (this.production_in_process.steps) {
      this.production_in_process.steps.forEach((step) => {
        if (step.step.time !== 0) {
          if (done && step.status == "DONE") {
            filtered.push(step);
          } else if (!done && step.status != "DONE") {
            filtered.push(step);
          }
        }
      });
    }
    return filtered;
  }

  stepBlocked(step: ProductionStepModel): boolean {
    return this.productionService.stepIsBlocked(
      this.production_in_process,
      step
    );
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

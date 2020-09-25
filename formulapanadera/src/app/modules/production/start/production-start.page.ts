import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { FormulaPresentModel, ProductionModel } from "src/app/core/models/production.model";

@Component({
  selector: "app-production-start",
  templateUrl: "production-start.page.html",
  styleUrls: ["./styles/production-start.page.scss"],
})
export class ProductionStartPage implements OnInit {
  production: ProductionModel;
  formulas: Array<FormulaPresentModel & { show: boolean }>;
  segment = "steps";

  state;

  constructor(private router: Router) {
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    this.production = JSON.parse(JSON.stringify(this.state.production));
    this.formulas = JSON.parse(JSON.stringify(this.state.formulas));
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }

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

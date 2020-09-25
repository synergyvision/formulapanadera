import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ProductionModel } from "src/app/core/models/production.model";

@Component({
  selector: "app-production-start",
  templateUrl: "production-start.page.html",
  styleUrls: ["./styles/production-start.page.scss"],
})
export class ProductionStartPage implements OnInit {
  production: ProductionModel;

  state;

  constructor(private router: Router) {
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    this.production = JSON.parse(JSON.stringify(this.state.production));
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

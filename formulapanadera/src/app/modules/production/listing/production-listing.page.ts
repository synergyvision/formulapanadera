import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-production-listing",
  templateUrl: "production-listing.page.html",
  styleUrls: [
    "./styles/production-listing.page.scss",
    "./styles/production-listing.filter.scss",
  ],
})
export class ProductionListingPage implements OnInit, OnDestroy {
  ICONS = ICONS;

  constructor(private router: Router) {}

  ngOnDestroy(): void {}

  ngOnInit() {}

  createProduction() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.management
    );
  }

  productionDetails() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.details,
      {
        state: { production: { name: "A" } },
      }
    );
  }
}

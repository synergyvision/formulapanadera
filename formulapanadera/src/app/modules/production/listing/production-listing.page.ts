import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { merge, Subscription } from "rxjs";
import { APP_URL, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { DataStore } from "src/app/shared/shell/data-store";
import { ShellModel } from "src/app/shared/shell/shell.model";

@Component({
  selector: "app-production-listing",
  templateUrl: "production-listing.page.html",
  styleUrls: [
    "./styles/production-listing.page.scss",
    "../../../shared/styles/filter.scss",
  ],
})
export class ProductionListingPage implements OnInit, OnDestroy {
  ICONS = ICONS;
  APP_URL = APP_URL;

  formulaDataStore: DataStore<Array<ProductionModel>>;
  stateSubscription: Subscription;

  productions: ProductionModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.productions && this.productions.isShell ? true : false;
  }
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.route.data.subscribe((resolvedRouteData) => {
      this.formulaDataStore = resolvedRouteData["data"];

      this.stateSubscription = merge(this.formulaDataStore.state).subscribe(
        (state) => {
          this.productions = state;
        }
      );
    });
  }

  createProduction() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.management
    );
  }

  productionDetails(production: ProductionModel) {
    if (production.id !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.details,
        {
          state: { production: production },
        }
      );
    }
  }
}

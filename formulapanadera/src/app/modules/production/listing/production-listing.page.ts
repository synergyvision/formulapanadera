import { Component, HostBinding, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { merge, Observable, ReplaySubject, Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { APP_URL, CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";
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

  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  productionDataStore: DataStore<Array<ProductionModel>>;
  stateSubscription: Subscription;

  currency = CURRENCY;
  productions: ProductionModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.productions && this.productions.isShell ? true : false;
  }
  constructor(
    private productionService: ProductionService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.route.data.subscribe((resolvedRouteData) => {
      this.productionDataStore = resolvedRouteData["data"];

      const updateSearchObservable = this.searchFiltersObservable.pipe(
        switchMap((filters) => {
          let filteredDataSource = this.productionService.searchProductionsByCost(
            filters.cost.lower,
            filters.cost.upper
          );

          const searchingShellModel = [];
          for (let index = 0; index < LOADING_ITEMS; index++) {
            searchingShellModel.push(new ProductionModel());
          }
          const dataSourceWithShellObservable = DataStore.AppendShell(
            filteredDataSource,
            searchingShellModel
          );

          return dataSourceWithShellObservable.pipe(
            map((filteredItems) => {
              // Just filter items by name if there is a search query and they are not shell values
              if (filters.query !== "" && !filteredItems.isShell) {
                const queryFilteredItems = filteredItems.filter((item) =>
                  item.name.toLowerCase().includes(filters.query.toLowerCase())
                );
                // While filtering we strip out the isShell property, add it again
                return Object.assign(queryFilteredItems, {
                  isShell: filteredItems.isShell,
                });
              } else {
                return filteredItems;
              }
            })
          );
        })
      );

      this.stateSubscription = merge(
        this.productionDataStore.state,
        updateSearchObservable
      ).subscribe((state) => {
        this.productions = state;
      });
    });
  }

  searchList() {
    this.searchSubject.next({
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      query: this.searchQuery,
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

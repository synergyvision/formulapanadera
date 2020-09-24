import { Component, HostBinding, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ViewWillEnter } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
import { ProductionService } from "src/app/core/services/production.service";
import { ProductionStorageService } from "src/app/core/services/storage/production.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
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
export class ProductionListingPage implements OnInit, ViewWillEnter {
  ICONS = ICONS;
  APP_URL = APP_URL;

  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  currency = CURRENCY;
  productions: ProductionModel[] & ShellModel;

  user_email: string;

  @HostBinding("class.is-shell") get isShell() {
    return this.productions && this.productions.isShell ? true : false;
  }
  constructor(
    private productionService: ProductionService,
    private productionCRUDService: ProductionCRUDService,
    private productionStorageService: ProductionStorageService,
    private router: Router,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    if (!(await this.productionStorageService.getProductions())) {
      this.productionCRUDService
        .getProductionsDataSource(this.user_email)
        .subscribe((productions) => {
          this.productionStorageService.setProductions(
            productions as ProductionModel[] & ShellModel
          );
          this.searchList();
        });
    }
  }

  async ionViewWillEnter() {
    if (await this.productionStorageService.getProductions()) {
      this.searchList();
    }
  }

  async searchList() {
    let filteredProductions = JSON.parse(
      JSON.stringify(await this.productionStorageService.getProductions())
    );
    let filters = {
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      query: this.searchQuery,
    };

    filteredProductions = this.productionService.searchProductionsByCost(
      filters.cost.lower,
      filters.cost.upper,
      filteredProductions
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredProductions),
      this.searchingState()
    );

    let updateSearchObservable = dataSourceWithShellObservable.pipe(
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

    updateSearchObservable.subscribe((value) => {
      this.productions = value;
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

  searchingState() {
    let searchingShellModel: ProductionModel[] &
      ShellModel = [] as ProductionModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new ProductionModel());
    }
    searchingShellModel.isShell = true;
    this.productions = searchingShellModel;
    return searchingShellModel;
  }
}

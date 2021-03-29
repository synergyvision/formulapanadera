import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { ViewWillEnter } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { CourseService } from "src/app/core/services/course.service";
import { ProductionService } from "src/app/core/services/production.service";
import { ProductionInProcessStorageService } from "src/app/core/services/storage/production-in-process.service";
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
  all_productions: ProductionModel[] & ShellModel;

  segment: string = "mine";
  isLoading: boolean = true;
  user_email: string;

  production_in_process: ProductionModel;

  courses: CourseModel[];

  constructor(
    private productionService: ProductionService,
    private productionInProcessStorageService: ProductionInProcessStorageService,
    private courseService: CourseService,
    private router: Router,
    private userStorageService: UserStorageService,
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.productions = this.productionService.searchingState();
    this.courses = this.courseService.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.productionService
      .getProductions()
      .subscribe(async (productions) => {
        this.productions = this.productionService.searchingState();
        this.all_productions = productions as ProductionModel[] & ShellModel;
        this.isLoading = true;
        this.searchList();
      });
    this.courseService.getSharedCourses().subscribe(async courses => {
      this.courses = [];
      courses?.forEach(course => {
        if (course.productions?.length > 0) {
          course.productions = this.courseService.orderItems(course.productions);
          this.courses.push(course);
        }
      })
    })
  }

  async ionViewWillEnter() {
    let existing_production = await this.productionInProcessStorageService.getProduction();
    if (existing_production) {
      this.production_in_process = existing_production.production;
    }
  }

  async searchList() {
    if (this.all_productions) {
      let filteredProductions = JSON.parse(
        JSON.stringify(this.all_productions)
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
      filteredProductions = this.productionService.searchProductionsByShared(
        this.segment,
        filteredProductions,
        this.user_email
      );

      const dataSourceWithShellObservable = DataStore.AppendShell(
        of(filteredProductions),
        this.productionService.searchingState()
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
        this.productions = this.productionService.sortProductions(value);
        this.isLoading = value.isShell;
      });
    }
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.isLoading = true;
    this.searchList();
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
    if (production.name !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.details,
        {
          state: { production: JSON.parse(JSON.stringify(production)) },
        }
      );
    }
  }

  navigateToProductionInProcess(production: ProductionModel) {
    if (production.id !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.start,
        {
          state: { production: JSON.parse(JSON.stringify(production)) },
        }
      );
    }
  }
}

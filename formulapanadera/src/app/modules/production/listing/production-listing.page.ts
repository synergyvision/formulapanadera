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
import { UserModel } from "src/app/core/models/user.model";
import { CourseService } from "src/app/core/services/course.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { ProductionService } from "src/app/core/services/production.service";
import { ProductionInProcessStorageService } from "src/app/core/services/storage/production-in-process.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { UserService } from "src/app/core/services/user.service";
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
  showMine = true;
  showShared = true;
  showPublic = true;

  currency = CURRENCY;
  productions: ProductionModel[] & ShellModel;
  all_productions: ProductionModel[] & ShellModel;

  isLoading: boolean = true;
  user: UserModel;

  production_in_process: ProductionModel;

  courses: CourseModel[];

  constructor(
    private productionService: ProductionService,
    private productionInProcessStorageService: ProductionInProcessStorageService,
    private courseService: CourseService,
    private router: Router,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.productions = this.productionService.searchingState();
    this.courses = this.courseService.searchingState();

    this.user = await this.userStorageService.getUser();
    this.productionService
      .getProductions()
      .subscribe(async (productions) => {
        this.productions = this.productionService.searchingState();
        this.all_productions = productions as ProductionModel[] & ShellModel;
        this.isLoading = true;
        this.searchList();
      });
    if (this.userService.hasPermission(this.user.role, [{ name: 'COURSE', type: 'VIEW' }])) {
      this.courseService.getSharedCourses().subscribe(async courses => {
        this.courses = [];
        courses?.forEach(course => {
          if (course.productions?.length > 0) {
            course.productions = this.courseService.orderItems(course.productions);
            this.courses.push(course);
          }
        })
      })
    } else {
      this.courses = [];
    }
  }

  async ionViewWillEnter() {
    let existing_production = await this.productionInProcessStorageService.getProduction();
    if (existing_production) {
      this.production_in_process = existing_production.production;
    }
  }

  async searchList() {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
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

  filteredCourses(): CourseModel[] {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
    let filters = {
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      query: this.searchQuery,
    };
    
    let filteredCourses: CourseModel[] = [];

    this.courses.forEach(course => {
      let filteredProductions: ProductionModel[] = Array.from([...course.productions], (item)=>{return item.item as ProductionModel});
      filteredProductions = this.productionService.searchProductionsByCost(
        filters.cost.lower,
        filters.cost.upper,
        filteredProductions as ProductionModel[] & ShellModel
      );
      if (filteredProductions.length > 0) {
        if (filters.query !== "") {
          let courseAdded = false;
          filteredProductions.forEach(production => {
            if (!courseAdded && production.name.toLowerCase().includes(filters.query.toLowerCase())) {
              filteredCourses.push(course);
              courseAdded = true;
            }
          })
        } else {
          filteredCourses.push(course);
        }
      }
    })

    return filteredCourses;
  }

  productionsSegment(segment: 'mine' | 'shared' | 'public'): ProductionModel[] {
    if (this.isLoading) {
      return this.productions;
    } else {
      return this.productionService.searchProductionsByShared(
        segment,
        this.productions,
        this.user.email
      );
    }
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

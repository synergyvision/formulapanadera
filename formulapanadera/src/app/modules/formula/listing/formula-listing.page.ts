import { Component, OnInit } from "@angular/core";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "src/app/core/models/formula.model";
import { of } from "rxjs";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { Router } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { ICONS } from "src/app/config/icons";
import { CourseModel } from "src/app/core/models/course.model";
import { CourseService } from "src/app/core/services/course.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { UserModel } from "src/app/core/models/user.model";
import { UserService } from "src/app/core/services/user.service";

@Component({
  selector: "app-formula-listing",
  templateUrl: "formula-listing.page.html",
  styleUrls: [
    "./styles/formula-listing.page.scss",
    "../../../shared/styles/filter.scss",
  ],
})
export class FormulaListingPage implements OnInit {
  ICONS = ICONS;
  APP_URL = APP_URL;

  hydrationRangeForm: FormGroup;
  fatRangeForm: FormGroup;
  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  showMine = true;
  showShared = true;
  showPublic = true;

  currency = CURRENCY;
  all_formulas: FormulaModel[] & ShellModel;
  formulas: FormulaModel[] & ShellModel;

  isLoading: boolean = true;

  user: UserModel;

  courses: CourseModel[];

  constructor(
    private formulaService: FormulaService,
    private courseService: CourseService,
    private router: Router,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 1000 }),
    });
    this.fatRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 1000 }),
    });
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.formulas = this.formulaService.searchingState();
    this.courses = this.courseService.searchingState();

    this.user = await this.userStorageService.getUser();
    this.formulaService
      .getFormulas()
      .subscribe((formulas) => {
        this.formulas = this.formulaService.searchingState();
        this.all_formulas = formulas as FormulaModel[] & ShellModel;
        this.isLoading = true;
        this.searchList();
      });
    if (this.userService.hasPermission(this.user.role, [{ name: 'COURSE', type: 'VIEW' }])) {
      this.courseService.getSharedCourses().subscribe(async courses => {
        this.courses = [];
        courses?.forEach(course => {
          if (course.formulas?.length > 0) {
            course.formulas = this.courseService.orderItems(course.formulas);
            this.courses.push(course);
          }
        })
      })
    } else {
      this.courses = [];
    }
  }

  searchList() {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
    if (this.all_formulas) {
      let filteredFormulas = JSON.parse(
        JSON.stringify(this.all_formulas)
      );
      let filters = {
        hydration: {
          lower: this.hydrationRangeForm.controls.dual.value.lower,
          upper: this.hydrationRangeForm.controls.dual.value.upper,
        },
        fat: {
          lower: this.fatRangeForm.controls.dual.value.lower,
          upper: this.fatRangeForm.controls.dual.value.upper,
        },
        cost: {
          lower: this.costRangeForm.value.lower,
          upper: this.costRangeForm.value.upper,
        },
        query: this.searchQuery,
      };

      filteredFormulas = this.formulaService.searchFormulasByHydration(
        filters.hydration.lower,
        filters.hydration.upper,
        filteredFormulas
      );
      filteredFormulas = this.formulaService.searchFormulasByFat(
        filters.fat.lower,
        filters.fat.upper,
        filteredFormulas
      );
      filteredFormulas = this.formulaService.searchFormulasByCost(
        filters.cost.lower,
        filters.cost.upper,
        filteredFormulas
      );

      const dataSourceWithShellObservable = DataStore.AppendShell(
        of(filteredFormulas),
        this.formulaService.searchingState()
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
        this.formulas = this.formulaService.sortFormulas(value);
        this.isLoading = value.isShell;
      });
    } else {
      this.formulas = [] as FormulaModel[] & ShellModel;
      this.isLoading = false;
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
      hydration: {
        lower: this.hydrationRangeForm.controls.dual.value.lower,
        upper: this.hydrationRangeForm.controls.dual.value.upper,
      },
      fat: {
        lower: this.fatRangeForm.controls.dual.value.lower,
        upper: this.fatRangeForm.controls.dual.value.upper,
      },
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      query: this.searchQuery,
    };

    let filteredCourses: CourseModel[] = [];

    this.courses.forEach(course => {
      let filteredFormulas: FormulaModel[] = Array.from([...course.formulas], (item)=>{return item.item as FormulaModel});
      filteredFormulas = this.formulaService.searchFormulasByHydration(
        filters.hydration.lower,
        filters.hydration.upper,
        filteredFormulas as FormulaModel[] & ShellModel
      );
      filteredFormulas = this.formulaService.searchFormulasByFat(
        filters.fat.lower,
        filters.fat.upper,
        filteredFormulas as FormulaModel[] & ShellModel
      );
      filteredFormulas = this.formulaService.searchFormulasByCost(
        filters.cost.lower,
        filters.cost.upper,
        filteredFormulas as FormulaModel[] & ShellModel
      );
      if (filteredFormulas.length > 0) {
        if (filters.query !== "") {
          let courseAdded = false;
          filteredFormulas.forEach(formula => {
            if (!courseAdded && formula.name.toLowerCase().includes(filters.query.toLowerCase())) {
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

  formulasSegment(segment: 'mine' | 'shared' | 'public'): FormulaModel[] {
    if (this.isLoading) {
      return this.formulas;
    } else {
      return this.formulaService.searchFormulasByShared(
        segment,
        this.formulas,
        this.user.email
      );
    }
  }

  createFormula() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.formula.main +
        "/" +
        APP_URL.menu.routes.formula.routes.management
    );
  }

  formulaDetails(formula: FormulaModel) {
    if (formula.name !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
        {
          state: { formula: JSON.parse(JSON.stringify(formula)) },
        }
      );
    }
  }
}

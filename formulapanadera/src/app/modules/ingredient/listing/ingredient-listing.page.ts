import { Component, HostBinding, OnInit } from "@angular/core";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../../shared/shell/shell.model";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../../shared/shell/data-store";
import { of } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { CourseModel } from "src/app/core/models/course.model";
import { CourseService } from "src/app/core/services/course.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-ingredient-listing",
  templateUrl: "ingredient-listing.page.html",
  styleUrls: [
    "./styles/ingredient-listing.page.scss",
    "../../../shared/styles/filter.scss",
  ],
})
export class IngredientListingPage implements OnInit {
  ICONS = ICONS;
  APP_URL = APP_URL;

  hydrationRangeForm: FormGroup;
  fatRangeForm: FormGroup;
  costRangeForm: FormGroup;
  isFlourForm: FormGroup;
  typeForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  currency = CURRENCY;
  ingredients: IngredientModel[] & ShellModel;
  all_ingredients: IngredientModel[] & ShellModel;

  segment: string = "mine";
  isLoading: boolean = true;

  user_email: string;

  courses: CourseModel[];

  @HostBinding("class.is-shell") get isShell() {
    return this.ingredients && this.ingredients.isShell ? true : false;
  }
  constructor(
    private ingredientService: IngredientService,
    private courseService: CourseService,
    private router: Router,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService
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
    this.isFlourForm = new FormGroup({
      value: new FormControl("all"),
    });
    this.typeForm = new FormGroup({
      value: new FormControl("all"),
    });

    this.ingredients = this.ingredientService.searchingState();
    this.courses = this.courseService.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.ingredientService
      .getIngredients()
      .subscribe((ingredients) => {
        this.ingredients = this.ingredientService.searchingState();
        this.all_ingredients = ingredients as IngredientModel[] & ShellModel;
        this.isLoading = true;
        this.searchList();
      });
    this.courseService.getSharedCourses().subscribe(async courses => {
      this.courses = [];
      courses?.forEach(course => {
        if (course.ingredients?.length > 0) {
          course.ingredients = this.courseService.orderItems(course.ingredients);
          this.courses.push(course);
        }
      })
    })
  }

  searchList() {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
    if (this.all_ingredients) {
      let filteredIngredients = JSON.parse(
        JSON.stringify(this.all_ingredients)
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
        is_flour: this.isFlourForm.value.value,
        type: this.typeForm.value.value,
        query: this.searchQuery,
      };

      filteredIngredients = this.ingredientService.searchIngredientsByHydration(
        filters.hydration.lower,
        filters.hydration.upper,
        filteredIngredients
      );
      filteredIngredients = this.ingredientService.searchIngredientsByFat(
        filters.fat.lower,
        filters.fat.upper,
        filteredIngredients
      );
      filteredIngredients = this.ingredientService.searchIngredientsByCost(
        filters.cost.lower,
        filters.cost.upper,
        filteredIngredients
      );
      if (filters.is_flour !== "all") {
        filteredIngredients = this.ingredientService.searchIngredientsByType(
          filters.is_flour,
          filteredIngredients
        );
      }
      if (filters.type !== "all") {
        filteredIngredients = this.ingredientService.searchIngredientsByFormula(
          filters.type,
          filteredIngredients
        );
      }
      filteredIngredients = this.ingredientService.searchIngredientsByShared(
        this.segment,
        filteredIngredients,
        this.user_email
      );

      const dataSourceWithShellObservable = DataStore.AppendShell(
        of(filteredIngredients),
        this.ingredientService.searchingState()
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
        this.ingredients = this.ingredientService.sortIngredients(value);
        this.isLoading = value.isShell;
      });
    }
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.isLoading = true;
    this.searchList();
  }

  createIngredient() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.ingredient.main +
        "/" +
        APP_URL.menu.routes.ingredient.routes.management
    );
  }

  ingredientDetails(ingredient: IngredientModel) {
    if (ingredient.name !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.ingredient.main +
          "/" +
          APP_URL.menu.routes.ingredient.routes.details,
        {
          state: { ingredient: JSON.parse(JSON.stringify(ingredient)) },
        }
      );
    }
  }
}

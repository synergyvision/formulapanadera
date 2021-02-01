import { Component, HostBinding, OnInit, OnDestroy } from "@angular/core";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../../shared/shell/shell.model";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../../shared/shell/data-store";
import { of } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";

@Component({
  selector: "app-ingredient-listing",
  templateUrl: "ingredient-listing.page.html",
  styleUrls: [
    "./styles/ingredient-listing.page.scss",
    "../../../shared/styles/filter.scss",
  ],
})
export class IngredientListingPage implements OnInit, OnDestroy {
  ICONS = ICONS;
  APP_URL = APP_URL;

  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  isFlourForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  currency = CURRENCY;
  ingredients: IngredientModel[] & ShellModel;

  segment: string = "mine";
  typeSegment: string = "simple";

  user_email: string;

  @HostBinding("class.is-shell") get isShell() {
    return this.ingredients && this.ingredients.isShell ? true : false;
  }
  constructor(
    private ingredientService: IngredientService,
    private ingredientCRUDService: IngredientCRUDService,
    private router: Router,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 1000 }),
    });
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });
    this.isFlourForm = new FormGroup({
      value: new FormControl("all"),
    });

    this.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.ingredientCRUDService
      .getIngredientsDataSource(this.user_email)
      .subscribe((ingredients) => {
        this.ingredientService.setIngredients(
          ingredients as IngredientModel[] & ShellModel
        );
        this.searchList();
      });
  }

  ngOnDestroy(): void {
    this.ingredientService.clearIngredients();
  }

  searchList() {
    let filteredIngredients = JSON.parse(
      JSON.stringify(this.ingredientService.getIngredients())
    );
    let filters = {
      hydration: {
        lower: this.hydrationRangeForm.controls.dual.value.lower,
        upper: this.hydrationRangeForm.controls.dual.value.upper,
      },
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      is_flour: this.isFlourForm.value.value,
      query: this.searchQuery,
    };

    filteredIngredients = this.ingredientService.searchIngredientsByHydration(
      filters.hydration.lower,
      filters.hydration.upper,
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
    filteredIngredients = this.ingredientService.searchIngredientsByFormula(
      this.typeSegment,
      filteredIngredients
    );
    filteredIngredients = this.ingredientService.searchIngredientsByShared(
      this.segment,
      filteredIngredients,
      this.user_email
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredIngredients),
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
      this.ingredients = this.ingredientService.sortIngredients(value);
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
  }

  typeSegmentChanged(ev: any) {
    this.typeSegment = ev.detail.value;
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
          state: { ingredient: ingredient },
        }
      );
    }
  }

  searchingState() {
    let searchingShellModel: IngredientModel[] &
      ShellModel = [] as IngredientModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new IngredientModel());
    }
    searchingShellModel.isShell = true;
    this.ingredients = searchingShellModel;
    return searchingShellModel;
  }
}

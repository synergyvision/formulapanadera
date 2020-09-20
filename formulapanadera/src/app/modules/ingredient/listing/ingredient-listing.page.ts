import { Component, HostBinding, OnInit, OnDestroy } from "@angular/core";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../../shared/shell/shell.model";
import { environment } from "../../../../environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../../shared/shell/data-store";
import { Subscription, ReplaySubject, Observable, merge } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { ActivatedRoute, Router } from "@angular/router";
import { switchMap, map, finalize } from "rxjs/operators";
import { CURRENCY } from 'src/app/config/units';

@Component({
  selector: "app-ingredient-listing",
  templateUrl: "ingredient-listing.page.html",
  styleUrls: [
    "./styles/ingredient-listing.page.scss",
    "./styles/ingredient-listing.filter.scss",
  ],
})
export class IngredientListingPage implements OnInit, OnDestroy {
  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  isFlourForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  firstLoad = true;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  ingredientsDataStore: DataStore<Array<IngredientModel>>;
  stateSubscription: Subscription;

  currency = CURRENCY;
  ingredients: IngredientModel[] & ShellModel;

  segment: string = "simple";

  @HostBinding("class.is-shell") get isShell() {
    return this.ingredients && this.ingredients.isShell ? true : false;
  }
  constructor(
    private ingredientService: IngredientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
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

    this.route.data.subscribe((resolvedRouteData) => {
      this.ingredientsDataStore = resolvedRouteData["data"];

      const updateSearchObservable = this.searchFiltersObservable.pipe(
        switchMap((filters) => {
          let filteredDataSource = this.ingredientService.searchIngredientsByHydration(
            filters.hydration.lower,
            filters.hydration.upper
          );
          filteredDataSource = this.ingredientService.searchIngredientsByCost(
            filters.cost.lower,
            filters.cost.upper,
            filteredDataSource
          );
          if (filters.is_flour !== "all") {
            filteredDataSource = this.ingredientService.searchIngredientsByType(
              filters.is_flour,
              filteredDataSource
            );
          }
          filteredDataSource = this.ingredientService.searchIngredientsByFormula(
            this.segment,
            filteredDataSource
          );

          const searchingShellModel = [
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
            new IngredientModel(),
          ];
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
        this.ingredientsDataStore.state,
        updateSearchObservable
      ).subscribe((state) => {
        this.ingredients = state;
        if (state.isShell == false && this.firstLoad == true) {
          this.searchList();
          this.firstLoad = false;
        }
      });
    });
  }

  searchList() {
    this.searchSubject.next({
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
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
  }

  createIngredient() {
    this.router.navigateByUrl("menu/ingredient/manage");
  }

  ingredientDetails(ingredient: IngredientModel) {
    if (ingredient.id !== undefined) {
      this.router.navigateByUrl("menu/ingredient/details", {
        state: { ingredient: ingredient },
      });
    }
  }
}

import {
  Component,
  HostBinding,
  OnInit,
  OnDestroy,
  Input,
} from "@angular/core";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../shell/shell.model";
import { environment } from "../../../../environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../shell/data-store";
import { Subscription, ReplaySubject, Observable, merge, of } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { ModalController } from "@ionic/angular";
import { switchMap, map } from "rxjs/operators";
import { IngredientListingResolver } from "src/app/core/resolvers/ingredient-listing.resolver";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { CURRENCY } from 'src/app/config/configuration';

@Component({
  selector: "app-ingredient-picker-modal",
  templateUrl: "ingredient-picker.modal.html",
  styleUrls: [
    "./styles/ingredient-picker.modal.scss",
    "./styles/ingredient-picker.filter.scss",
    "./../../alert/language/styles/language.alert.scss",
  ],
})
export class IngredientPickerModal implements OnInit, OnDestroy {
  @Input() selectedIngredients: Array<IngredientPercentageModel>;
  @Input() limit?: number;

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
    private ingredientResolver: IngredientListingResolver,
    public modalController: ModalController
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

    const data = of(this.ingredientResolver.resolve());

    data.subscribe((resolvedRouteData) => {
      this.ingredientsDataStore = resolvedRouteData;

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

  clickIngredient(ingredient: IngredientModel) {
    if (ingredient !== undefined && ingredient.id !== undefined) {
      if (this.selectedIngredients === undefined) {
        this.selectedIngredients = [];
      }
      if (this.isSelected(ingredient)) {
        for (let index = 0; index < this.selectedIngredients.length; index++) {
          if (this.selectedIngredients[index].ingredient.id === ingredient.id)
            this.selectedIngredients.splice(index, 1);
        }
      } else {
        if (this.limit) {
          this.selectedIngredients = [];
        }
        this.selectedIngredients.push({
          percentage: null,
          ingredient: ingredient,
        });
      }
    }
  }

  saveIngredients() {
    this.modalController.dismiss({
      ingredients: this.selectedIngredients,
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isSelected(ingredient: IngredientModel): boolean {
    let isSelected = false;
    if (this.selectedIngredients !== undefined) {
      this.selectedIngredients.map((selectedIngredient) => {
        if (ingredient.id == selectedIngredient.ingredient.id) {
          isSelected = true;
        }
      });
    }
    return isSelected;
  }
}

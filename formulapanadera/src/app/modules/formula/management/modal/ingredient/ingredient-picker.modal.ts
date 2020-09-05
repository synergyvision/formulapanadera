import {
  Component,
  HostBinding,
  OnInit,
  OnDestroy,
  Input,
} from "@angular/core";
import { IngredientModel } from "../../../../../core/models/ingredient.model";
import { ShellModel } from "../../../../../shared/shell/shell.model";
import { environment } from "../../../../../../environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../../../../shared/shell/data-store";
import { Subscription, ReplaySubject, Observable, merge, of } from "rxjs";
import { IngredientService } from "../../../../../core/services/ingredient.service";
import { ModalController, AlertController } from "@ionic/angular";
import { switchMap, map } from "rxjs/operators";
import { IngredientListingResolver } from "src/app/core/resolvers/ingredient-listing.resolver";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-ingredient-picker-modal",
  templateUrl: "ingredient-picker.modal.html",
  styleUrls: [
    "./styles/ingredient-picker.modal.scss",
    "./styles/ingredient-picker.filter.scss",
    "./../../../../../shared/styles/language.alert.scss",
  ],
})
export class IngredientPickerModal implements OnInit, OnDestroy {
  @Input() selectedIngredients: Array<IngredientPercentageModel>;
  @Input() formulaUnit: string;

  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  isFlourForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  ingredientsDataStore: DataStore<Array<IngredientModel>>;
  stateSubscription: Subscription;

  ingredient_cost_unit = environment.ingredient_cost_unit;
  ingredients: IngredientModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.ingredients && this.ingredients.isShell ? true : false;
  }
  constructor(
    private ingredientService: IngredientService,
    private ingredientResolver: IngredientListingResolver,
    private alertController: AlertController,
    public modalController: ModalController,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.searchQuery = "";

    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 100 }),
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
          const searchingShellModel = [new IngredientModel()];
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

  async clickIngredient(ingredient: IngredientModel) {
    const alert = await this.alertController.create({
      cssClass: "ingredient-percentage-alert alert",
      header: `${this.languageService.getTerm(
        "formulas.ingredients.percentage"
      )} (${this.formulaUnit})`,
      inputs: [
        {
          name: "percentage",
          type: "number",
          placeholder: this.languageService.getTerm(
            "formulas.ingredients.percentage"
          ),
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            if (data.percentage > 0) {
              this.modalController.dismiss({
                percentage: this.formatNumberService.formatNumberPercentage(
                  data.percentage
                ),
                ingredient: ingredient,
              });
            }
          },
        },
      ],
    });

    await alert.present();
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

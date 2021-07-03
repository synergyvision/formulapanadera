import { Component, OnInit, Input } from "@angular/core";
import { IngredientListingModel, IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../shell/shell.model";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../shell/data-store";
import { of } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { ModalController } from "@ionic/angular";
import { map } from "rxjs/operators";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";

@Component({
  selector: "app-ingredient-picker-modal",
  templateUrl: "ingredient-picker.modal.html",
  styleUrls: [
    "./styles/ingredient-picker.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class IngredientPickerModal implements OnInit {
  ICONS = ICONS;

  @Input() selectedIngredients: Array<IngredientPercentageModel>;
  @Input() limit?: number;

  hydrationRangeForm: FormGroup;
  fatRangeForm: FormGroup;
  costRangeForm: FormGroup;
  isFlourForm: FormGroup;
  typeForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  showMine = true;
  showShared = true;
  showPublic = true;

  currency = CURRENCY;
  ingredients: IngredientModel[];
  all_ingredients: IngredientModel[];

  isLoading: boolean = true;

  user_email: string;
  
  constructor(
    private ingredientService: IngredientService,
    public modalController: ModalController,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService,
    private ingredientCRUDService: IngredientCRUDService
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

    this.user_email = (await this.userStorageService.getUser()).email;
    this.all_ingredients = await this.ingredientCRUDService.getLocalData() as IngredientModel[];
    this.isLoading = true;
    this.searchList();
  }

  searchList() {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
    let filteredIngredients = JSON.parse(
      JSON.stringify(this.all_ingredients ? this.all_ingredients : [])
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

  ingredientsSegment(segment: 'mine' | 'shared' | 'public') {
    if (this.isLoading) {
      return this.ingredients;
    } else {
      return this.ingredientService.searchIngredientsByShared(
        segment,
        this.ingredients as IngredientModel[] & ShellModel,
        this.user_email
      );
    }
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

import { Component, HostBinding, OnInit, OnDestroy } from "@angular/core";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { ShellModel } from "../../../shared/shell/shell.model";
import { environment } from "../../../../environments/environment";
import { FormGroup, FormControl } from "@angular/forms";
import { DataStore } from "../../../shared/shell/data-store";
import { Subscription, ReplaySubject, Observable, merge } from "rxjs";
import { IngredientService } from "../../../core/services/ingredient.service";
import { ActivatedRoute } from "@angular/router";
import { ModalController, IonRouterOutlet } from "@ionic/angular";
import { switchMap, map } from "rxjs/operators";
import { IngredientManagementModal } from "../management/ingredient-management.modal";

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
  searchQuery: string;
  showHydrationFilter = false;

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
    public modalController: ModalController,
    private route: ActivatedRoute,
    private routerOutlet: IonRouterOutlet
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  ngOnInit() {
    this.searchQuery = "";

    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 100 }),
    });

    this.route.data.subscribe((resolvedRouteData) => {
      this.ingredientsDataStore = resolvedRouteData["data"];

      const updateSearchObservable = this.searchFiltersObservable.pipe(
        switchMap((filters) => {
          const filteredDataSource = this.ingredientService.searchIngredientsByHydration(
            filters.lower,
            filters.upper
          );
          const searchingShellModel = [
            new IngredientModel(),
            new IngredientModel(),
          ];
          // Wait on purpose some time to ensure the shell animation gets shown while loading filtered data
          const searchingDelay = 400;

          const dataSourceWithShellObservable = DataStore.AppendShell(
            filteredDataSource,
            searchingShellModel,
            searchingDelay
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
      lower: this.hydrationRangeForm.controls.dual.value.lower,
      upper: this.hydrationRangeForm.controls.dual.value.upper,
      query: this.searchQuery,
    });
  }

  async openModal(type: string, ingredient?: IngredientModel) {
    const modal = await this.modalController.create({
      component: IngredientManagementModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: { type: type, ingredient: ingredient },
    });
    await modal.present();
  }
}

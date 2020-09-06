import { Component, OnInit, OnDestroy, HostBinding } from "@angular/core";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "src/app/core/models/formula.model";
import { Subscription, merge, ReplaySubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";
import { switchMap, map } from "rxjs/operators";

@Component({
  selector: "app-formula-listing",
  templateUrl: "formula-listing.page.html",
  styleUrls: [
    "./styles/formula-listing.page.scss",
    "./styles/formula-listing.filter.scss",
  ],
})
export class FormulaListingPage implements OnInit, OnDestroy {
  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  formulaDataStore: DataStore<Array<FormulaModel>>;
  stateSubscription: Subscription;

  currency = environment.currency;
  formulas: FormulaModel[] & ShellModel;

  @HostBinding("class.is-shell") get isShell() {
    return this.formulas && this.formulas.isShell ? true : false;
  }
  constructor(
    private formulaService: FormulaService,
    private route: ActivatedRoute,
    private router: Router
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

    this.route.data.subscribe((resolvedRouteData) => {
      this.formulaDataStore = resolvedRouteData["data"];

      const updateSearchObservable = this.searchFiltersObservable.pipe(
        switchMap((filters) => {
          let filteredDataSource = this.formulaService.searchFormulasByHydration(
            filters.hydration.lower,
            filters.hydration.upper
          );
          filteredDataSource = this.formulaService.searchFormulasByCost(
            filters.cost.lower,
            filters.cost.upper,
            filteredDataSource
          );
          const searchingShellModel = [new FormulaModel()];
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
        this.formulaDataStore.state,
        updateSearchObservable
      ).subscribe((state) => {
        this.formulas = state;
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
      query: this.searchQuery,
    });
  }

  createFormula() {
    this.router.navigateByUrl("menu/formula/manage");
  }

  formulaDetails(formula: FormulaModel) {
    if (formula.id !== undefined) {
      this.router.navigateByUrl("menu/formula/details", {
        state: { formula: formula },
      });
    }
  }
}

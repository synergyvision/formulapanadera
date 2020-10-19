import { Component, OnInit, HostBinding, OnDestroy } from "@angular/core";
import { DataStore } from "src/app/shared/shell/data-store";
import { FormulaModel } from "src/app/core/models/formula.model";
import { of } from "rxjs";
import { ShellModel } from "src/app/shared/shell/shell.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { Router } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";
import { map } from "rxjs/operators";
import { APP_URL, CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { ICONS } from "src/app/config/icons";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";

@Component({
  selector: "app-formula-listing",
  templateUrl: "formula-listing.page.html",
  styleUrls: [
    "./styles/formula-listing.page.scss",
    "../../../shared/styles/filter.scss",
  ],
})
export class FormulaListingPage implements OnInit, OnDestroy {
  ICONS = ICONS;
  APP_URL = APP_URL;

  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;

  currency = CURRENCY;
  formulas: FormulaModel[] & ShellModel;

  segment: string = "mine";

  user_email: string;

  @HostBinding("class.is-shell") get isShell() {
    return this.formulas && this.formulas.isShell ? true : false;
  }
  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private router: Router,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 100 }),
    });
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.formulaCRUDService
      .getFormulasDataSource(this.user_email)
      .subscribe((formulas) => {
        this.formulaService.setFormulas(
          formulas as FormulaModel[] & ShellModel
        );
        this.searchList();
      });
  }

  ngOnDestroy() {
    this.formulaService.clearFormulas();
  }

  searchList() {
    let filteredFormulas = JSON.parse(
      JSON.stringify(this.formulaService.getFormulas())
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
      query: this.searchQuery,
    };

    filteredFormulas = this.formulaService.searchFormulasByHydration(
      filters.hydration.lower,
      filters.hydration.upper,
      filteredFormulas
    );
    filteredFormulas = this.formulaService.searchFormulasByCost(
      filters.cost.lower,
      filters.cost.upper,
      filteredFormulas
    );
    filteredFormulas = this.formulaService.searchFormulasByShared(
      this.segment,
      filteredFormulas,
      this.user_email
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredFormulas),
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
      this.formulas = this.formulaService.sortFormulas(value);
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
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
    if (formula.id !== undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
        {
          state: { formula: formula },
        }
      );
    }
  }

  searchingState() {
    let searchingShellModel: FormulaModel[] &
      ShellModel = [] as FormulaModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new FormulaModel());
    }
    searchingShellModel.isShell = true;
    this.formulas = searchingShellModel;
    return searchingShellModel;
  }
}

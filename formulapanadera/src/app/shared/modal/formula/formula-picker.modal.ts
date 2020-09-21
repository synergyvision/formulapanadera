import {
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { merge, Observable, of, ReplaySubject, Subscription } from "rxjs";
import { map, switchMap } from "rxjs/operators";
import { CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { FormulaModel } from "src/app/core/models/formula.model";
import { FormulaNumberModel } from "src/app/core/models/production.model";
import { FormulaListingResolver } from "src/app/core/resolvers/formula-listing.resolver";
import { FormulaService } from "src/app/core/services/formula.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { DataStore } from "../../shell/data-store";
import { ShellModel } from "../../shell/shell.model";

@Component({
  selector: "app-formula-picker-modal",
  templateUrl: "formula-picker.modal.html",
  styleUrls: [
    "./styles/formula-picker.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class FormulaPickerModal implements OnInit, OnDestroy {
  ICONS = ICONS;

  @Input() selectedFormulas: Array<FormulaNumberModel>;

  hydrationRangeForm: FormGroup;
  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  firstLoad = true;

  searchSubject: ReplaySubject<any> = new ReplaySubject<any>(1);
  searchFiltersObservable: Observable<any> = this.searchSubject.asObservable();

  formulaDataStore: DataStore<Array<FormulaModel>>;
  stateSubscription: Subscription;

  currency = CURRENCY;
  formulas: FormulaModel[] & ShellModel;

  segment: string = "mine";

  @HostBinding("class.is-shell") get isShell() {
    return this.formulas && this.formulas.isShell ? true : false;
  }
  constructor(
    private formulaService: FormulaService,
    private formulaResolver: FormulaListingResolver,
    public modalController: ModalController,
    private userStorageService: UserStorageService
  ) {}

  ngOnDestroy(): void {
    this.stateSubscription.unsubscribe();
  }

  async ngOnInit() {
    this.searchQuery = "";
    this.hydrationRangeForm = new FormGroup({
      dual: new FormControl({ lower: 0, upper: 100 }),
    });
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    let user_email: string = (await this.userStorageService.getUser()).email;

    const data = of(this.formulaResolver.resolve());

    data.subscribe(async (resolvedRouteData) => {
      this.formulaDataStore = await resolvedRouteData;

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
          filteredDataSource = this.formulaService.searchFormulasByShared(
            this.segment,
            filteredDataSource,
            user_email
          );

          const searchingShellModel = [];
          for (let index = 0; index < LOADING_ITEMS; index++) {
            searchingShellModel.push(new FormulaModel());
          }
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
      query: this.searchQuery,
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
  }

  clickFormula(formula: FormulaModel) {
    if (formula !== undefined && formula.id !== undefined) {
      if (this.selectedFormulas === undefined) {
        this.selectedFormulas = [];
      }
      if (this.isSelected(formula)) {
        for (let index = 0; index < this.selectedFormulas.length; index++) {
          if (this.selectedFormulas[index].formula.id === formula.id)
            this.selectedFormulas.splice(index, 1);
        }
      } else {
        this.selectedFormulas.push({
          number: null,
          formula: formula,
        });
      }
    }
  }

  saveFormulas() {
    this.modalController.dismiss({
      formulas: this.selectedFormulas,
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isSelected(formula: FormulaModel): boolean {
    let isSelected = false;
    if (this.selectedFormulas !== undefined) {
      this.selectedFormulas.map((selectedFormula) => {
        if (formula.id == selectedFormula.formula.id) {
          isSelected = true;
        }
      });
    }
    return isSelected;
  }
}

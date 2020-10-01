import { Component, HostBinding, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { FORMULA_WARMING_TIME } from "src/app/config/formula";
import { ICONS } from "src/app/config/icons";
import { FormulaModel } from "src/app/core/models/formula.model";
import { FormulaNumberModel } from "src/app/core/models/production.model";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
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
export class FormulaPickerModal implements OnInit {
  ICONS = ICONS;

  @Input() selectedFormulas: Array<FormulaNumberModel>;

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
    public modalController: ModalController,
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
    if (!this.formulaService.getFormulas()) {
      this.formulaCRUDService
        .getFormulasDataSource(this.user_email)
        .subscribe((formulas) => {
          this.formulaService.setFormulas(
            formulas as FormulaModel[] & ShellModel
          );
          this.searchList();
        });
    } else {
      this.searchList();
    }
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
      this.formulas = value;
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
          warming_time: FORMULA_WARMING_TIME,
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

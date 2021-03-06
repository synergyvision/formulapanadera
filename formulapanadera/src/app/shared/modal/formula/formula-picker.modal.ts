import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { CURRENCY } from "src/app/config/configuration";
import { FORMULA_WARMING_TIME } from "src/app/config/formula";
import { ICONS } from "src/app/config/icons";
import { FormulaModel } from "src/app/core/models/formula.model";
import { FormulaNumberModel } from "src/app/core/models/production.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
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
  @Input() forProduction: boolean = false;

  hydrationRangeForm: FormGroup;
  fatRangeForm: FormGroup;
  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  showMine = true;
  showShared = true;
  showPublic = true;

  currency = CURRENCY;
  formulas: FormulaModel[] & ShellModel;
  all_formulas: FormulaModel[] & ShellModel;

  isLoading: boolean = true;
  user_email: string;

  constructor(
    private formulaService: FormulaService,
    public modalController: ModalController,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService
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

    this.formulas = this.formulaService.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.formulaService
      .getFormulas()
      .subscribe(async (formulas) => {
        this.formulas = this.formulaService.searchingState();
        if (this.forProduction) {
          let aux: FormulaModel[] = []
          formulas.forEach(formula => {
            if (formula.steps && formula.steps.length > 0) {
              aux.push(formula)
            }
          })
          formulas = aux;
        }
        this.all_formulas = formulas as FormulaModel[] & ShellModel;
        this.isLoading = true;
        this.searchList();
      });
  }

  searchList() {
    this.costRangeForm
      .get("lower")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.lower));
    this.costRangeForm
      .get("upper")
      .patchValue(this.formatNumberService.formatStringToDecimals(this.costRangeForm.value.upper));
    let filteredFormulas = JSON.parse(
      JSON.stringify(this.all_formulas ? this.all_formulas : [])
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
      query: this.searchQuery,
    };

    filteredFormulas = this.formulaService.searchFormulasByHydration(
      filters.hydration.lower,
      filters.hydration.upper,
      filteredFormulas
    );
    filteredFormulas = this.formulaService.searchFormulasByFat(
      filters.fat.lower,
      filters.fat.upper,
      filteredFormulas
    );
    filteredFormulas = this.formulaService.searchFormulasByCost(
      filters.cost.lower,
      filters.cost.upper,
      filteredFormulas
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredFormulas),
      this.formulaService.searchingState()
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
      this.isLoading = value.isShell;
    });
  }

  formulasSegment(segment: 'mine' | 'shared' | 'public'): FormulaModel[] {
    if (this.isLoading) {
      return this.formulas;
    } else {
      return this.formulaService.searchFormulasByShared(
        segment,
        this.formulas,
        this.user_email
      );
    }
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
}

import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { ProductionService } from "src/app/core/services/production.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { DataStore } from "../../shell/data-store";
import { ShellModel } from "../../shell/shell.model";

@Component({
  selector: "app-production-picker-modal",
  templateUrl: "production-picker.modal.html",
  styleUrls: [
    "./styles/production-picker.modal.scss",
    "./../../styles/filter.scss",
  ],
})
export class ProductionPickerModal implements OnInit {
  ICONS = ICONS;

  @Input() selectedProductions: Array<ProductionModel>;

  costRangeForm: FormGroup;
  searchQuery: string;
  showFilters = false;
  showMine = true;
  showShared = true;
  showPublic = true;

  currency = CURRENCY;
  productions: ProductionModel[] & ShellModel;
  all_productions: ProductionModel[] & ShellModel;

  isLoading: boolean = true;
  user_email: string;

  constructor(
    private productionService: ProductionService,
    public modalController: ModalController,
    private userStorageService: UserStorageService,
    private formatNumberService: FormatNumberService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.productions = this.productionService.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    this.productionService
      .getProductions()
      .subscribe(async (productions) => {
        this.productions = this.productionService.searchingState();
        this.all_productions = productions as ProductionModel[] & ShellModel;
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
    let filteredProductions = JSON.parse(
      JSON.stringify(this.all_productions ? this.all_productions : [])
    );
    let filters = {
      cost: {
        lower: this.costRangeForm.value.lower,
        upper: this.costRangeForm.value.upper,
      },
      query: this.searchQuery,
    };

    filteredProductions = this.productionService.searchProductionsByCost(
      filters.cost.lower,
      filters.cost.upper,
      filteredProductions
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredProductions),
      this.productionService.searchingState()
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
      this.productions = this.productionService.sortProductions(value);
      this.isLoading = value.isShell;
    });
  }

  productionsSegment(segment: 'mine' | 'shared' | 'public'): ProductionModel[] {
    if (this.isLoading) {
      return this.productions;
    } else {
      return this.productionService.searchProductionsByShared(
        segment,
        this.productions,
        this.user_email
      );
    }
  }

  clickProduction(production: ProductionModel) {
    if (production !== undefined && production.id !== undefined) {
      if (this.selectedProductions === undefined) {
        this.selectedProductions = [];
      }
      if (this.isSelected(production)) {
        for (let index = 0; index < this.selectedProductions.length; index++) {
          if (this.selectedProductions[index].id === production.id)
            this.selectedProductions.splice(index, 1);
        }
      } else {
        this.selectedProductions.push(production);
      }
    }
  }

  saveProductions() {
    this.modalController.dismiss({
      productions: this.selectedProductions,
    });
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  isSelected(production: ProductionModel): boolean {
    let isSelected = false;
    if (this.selectedProductions !== undefined) {
      this.selectedProductions.map((selectedProduction) => {
        if (production.id == selectedProduction.id) {
          isSelected = true;
        }
      });
    }
    return isSelected;
  }
}

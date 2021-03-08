import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";
import { of } from "rxjs";
import { map } from "rxjs/operators";
import { CURRENCY, LOADING_ITEMS } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
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

  currency = CURRENCY;
  productions: ProductionModel[] & ShellModel;

  segment: string = "mine";
  user_email: string;

  constructor(
    private productionService: ProductionService,
    private productionCRUDService: ProductionCRUDService,
    public modalController: ModalController,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit() {
    this.searchQuery = "";
    this.costRangeForm = new FormGroup({
      lower: new FormControl(),
      upper: new FormControl(),
    });

    this.searchingState();

    this.user_email = (await this.userStorageService.getUser()).email;
    if (!this.productionService.getProductions()) {
      this.productionCRUDService
        .getProductionsDataSource(this.user_email)
        .subscribe(async (productions) => {
          this.searchingState();
          const promises = productions.map((prod) => this.productionCRUDService.getFormulas(prod));
          await Promise.all(promises);
          this.productionService.setProductions(
            productions as ProductionModel[] & ShellModel
          );
          this.searchList();
        });
    } else {
      this.searchList();
    }
  }

  searchList() {
    let filteredProductions = JSON.parse(
      JSON.stringify(this.productionService.getProductions())
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
    filteredProductions = this.productionService.searchProductionsByShared(
      this.segment,
      filteredProductions,
      this.user_email
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filteredProductions),
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
      this.productions = this.productionService.sortProductions(value);
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
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

  searchingState() {
    let searchingShellModel: ProductionModel[] &
      ShellModel = [] as ProductionModel[] & ShellModel;
    for (let index = 0; index < LOADING_ITEMS; index++) {
      searchingShellModel.push(new ProductionModel());
    }
    searchingShellModel.isShell = true;
    this.productions = searchingShellModel;
    return searchingShellModel;
  }
}

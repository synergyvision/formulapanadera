import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ActionSheetController } from "@ionic/angular";
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL, LOADING_ITEMS } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { LanguageService } from "src/app/core/services/language.service";
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { DataStore } from 'src/app/shared/shell/data-store';
import { ShellModel } from 'src/app/shared/shell/shell.model';

@Component({
  selector: "app-shared-listing",
  templateUrl: "./shared-listing.page.html",
  styleUrls: ["./styles/shared-listing.page.scss", "../../../../shared/styles/filter.scss"],
})
export class SharedListingPage implements OnInit {
  ICONS = ICONS;
  APP_URL = APP_URL;

  segment: string = "formulas";
  searchQuery: string;

  productions: ProductionModel[] & ShellModel;
  formulas: FormulaModel[] & ShellModel;
  ingredients: IngredientModel[] & ShellModel;

  user_email: string;

  constructor(
    private languageService: LanguageService,
    private actionSheetController: ActionSheetController,
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private userStorageService: UserStorageService,
    private router: Router
  ) { }
  
  async ngOnInit() {
    this.searchQuery = "";
    this.searchingState(this.segment);

    this.user_email = (await this.userStorageService.getUser()).email;

    if (!this.formulaService.getFormulas()) {
      this.formulaCRUDService
        .getFormulasDataSource(this.user_email)
        .subscribe((formulas) => {
          this.formulaService.setFormulas(
            formulas as FormulaModel[] & ShellModel
          );
          this.searchList(this.segment);
        });
    } else {
      this.searchList(this.segment);
    }
  }

  searchList(segment: string) {
    let filtered = [];
    if (segment == "formulas") {
      filtered = JSON.parse(
        JSON.stringify(this.formulaService.getFormulas())
      );
    }
    let filters = {
      query: this.searchQuery,
    };

    filtered = filtered.filter((item) =>
      item.user.shared_users && item.user.shared_users.length>0
    );

    const dataSourceWithShellObservable = DataStore.AppendShell(
      of(filtered),
      this.searchingState(this.segment)
    );

    let updateSearchObservable = dataSourceWithShellObservable.pipe(
      map((filteredItems) => {
        // Just filter items by name if there is a search query and they are not shell values
        if (filters.query !== "" && !filteredItems.isShell) {
          let queryFilteredItems = filteredItems.filter((item) =>
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
      if (segment == "formulas") {
        this.formulas = this.formulaService.sortFormulas(value);
      }
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList(this.segment);
  }

  searchingState(segment: string) {
    if (segment == "formulas") {
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

  // Formula

  async presentFormulaOptions(formula: FormulaModel) {
    let buttons = [
      {
        text: this.languageService.getTerm("action.sync_shared"),
        icon: ICONS.sync,
        cssClass: "action-icon",
        handler: () => {},
      },
      {
        text: this.languageService.getTerm("action.manage_shared"),
        icon: ICONS.share,
        cssClass: "action-icon",
        handler: () => {},
      },
      {
        text: this.languageService.getTerm("action.view_details"),
        icon: ICONS.details,
        cssClass: "action-icon",
        handler: () => {
          this.formulaDetails(formula)
        },
      },
      {
        text: this.languageService.getTerm("action.cancel"),
        icon: ICONS.close,
        role: "cancel",
        cssClass: "cancel-icon",
        handler: () => {},
      }
    ];

    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: buttons,
    });
    await actionSheet.present();
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
}

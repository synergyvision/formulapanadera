import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController, ToastController, ViewWillEnter } from "@ionic/angular";
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientListingModel, IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { IngredientService } from "src/app/core/services/ingredient.service";
import { LanguageService } from "src/app/core/services/language.service";
import { ProductionService } from "src/app/core/services/production.service";
import { UserStorageService } from 'src/app/core/services/storage/user.service';
import { SharedUsersModal } from "src/app/shared/modal/shared-users/shared-users.modal";
import { DataStore } from 'src/app/shared/shell/data-store';
import { ShellModel } from 'src/app/shared/shell/shell.model';

@Component({
  selector: "app-shared-listing",
  templateUrl: "./shared-listing.page.html",
  styleUrls: ["./styles/shared-listing.page.scss", "../../../../shared/styles/filter.scss"],
})
export class SharedListingPage implements OnInit, ViewWillEnter {
  ICONS = ICONS;
  APP_URL = APP_URL;

  segment: string = "formulas";
  searchQuery: string;

  productions: ProductionModel[] & ShellModel;
  formulas: FormulaModel[] & ShellModel;
  ingredients: IngredientModel[];

  all_productions: ProductionModel[] & ShellModel;
  all_formulas: FormulaModel[] & ShellModel;
  all_ingredients: IngredientModel[];

  user_email: string;

  constructor(
    private modalController: ModalController,
    private languageService: LanguageService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private ingredientService: IngredientService,
    private formulaService: FormulaService,
    private productionService: ProductionService,
    private userStorageService: UserStorageService,
    private router: Router,
    private routerOutlet: IonRouterOutlet,
    private ingredientCRUDService: IngredientCRUDService
  ) { }
  
  async ngOnInit() {
    this.searchQuery = "";
    this.searchingState(this.segment);

    this.user_email = (await this.userStorageService.getUser()).email;

    this.productionService
      .getProductions()
      .subscribe(async (productions) => {
        this.searchingState(this.segment);
        this.all_productions = productions as ProductionModel[] & ShellModel;
      });
    this.formulaService
      .getFormulas()
      .subscribe(async (formulas) => {
        this.searchingState(this.segment);
        this.all_formulas = formulas as FormulaModel[] & ShellModel;
        this.searchList();
      });
  }

  ionViewWillEnter() {
    if (this.formulaService.getFormulas()) {
      this.searchingState(this.segment);
      this.searchList();
    }
  }

  async searchList() {
    this.all_ingredients = await this.ingredientCRUDService.getLocalData() as IngredientModel[];
    if (this.all_ingredients || this.all_formulas || this.all_productions) {
      let filtered = [];
      if (this.segment == "ingredients") {
        filtered = JSON.parse(
          JSON.stringify(this.all_ingredients ? this.all_ingredients : [])
        );
      }
      if (this.segment == "formulas") {
        filtered = JSON.parse(
          JSON.stringify(this.all_formulas ? this.all_formulas : [])
        );
      }
      if (this.segment == "productions") {
        filtered = JSON.parse(
          JSON.stringify(this.all_productions ? this.all_productions : [])
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
        if (this.segment == "ingredients") {
          this.ingredients = this.ingredientService.sortIngredients(value) as IngredientModel[] & ShellModel;
        }
        if (this.segment == "formulas") {
          this.formulas = this.formulaService.sortFormulas(value);
        }
        if (this.segment == "productions") {
          this.productions = this.productionService.sortProductions(value);
        }
      });
    }
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
  }

  searchingState(segment: string) {
    if (segment == "ingredients") {
      this.ingredients = this.ingredientService.searchingState();
      return this.ingredients;
    }
    if (segment == "formulas") {
      this.formulas = this.formulaService.searchingState();
      return this.formulas;
    }
    if (segment == "productions") {
      this.productions = this.productionService.searchingState();
      return this.productions;
    }
  }

  async presentToast(success: boolean, email?: string) {
    let message = ""
    message = `${email}: `;
    if (success) {
      message = message + this.languageService.getTerm("send.success")
    } else {
      message = message + this.languageService.getTerm("send.error")
    }
    const toast = await this.toastController.create({
      message: message,
      color: "secondary",
      duration: 5000,
      buttons: [
        {
          icon: ICONS.close,
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    toast.present();
  }

  async presentOptions(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    let buttons = [
      {
        text: this.languageService.getTerm("action.manage_shared"),
        icon: ICONS.share,
        cssClass: "action-icon",
        handler: () => {
            this.manageShared(type, item)
        },
      },
      {
        text: this.languageService.getTerm("action.view_details"),
        icon: ICONS.details,
        cssClass: "action-icon",
        handler: () => {
          this.details(type, item);
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

  async manageShared(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    const modal = await this.modalController.create({
      component: SharedUsersModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        type: type,
        item: item
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.searchList();
  }

  async details(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    if (item.name !== undefined) {
      if (type == "ingredient") {
        let ingredient = await this.ingredientCRUDService.updatedCacheData(item as IngredientListingModel);
        if (ingredient) {
          this.router.navigateByUrl(
            APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.ingredient.main +
            "/" +
            APP_URL.menu.routes.ingredient.routes.details,
            {
              state: { ingredient: JSON.parse(JSON.stringify(ingredient)) },
            }
          );
        }
      }
      if (type == "formula") {
        this.router.navigateByUrl(
          APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
          {
            state: { formula: JSON.parse(JSON.stringify(item)) },
          }
        );
      }
      if (type == "production") { 
        this.router.navigateByUrl(
          APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.production.main +
            "/" +
            APP_URL.menu.routes.production.routes.details,
          {
            state: { production: JSON.parse(JSON.stringify(item)) },
          }
        );
      }
    }
  }
}

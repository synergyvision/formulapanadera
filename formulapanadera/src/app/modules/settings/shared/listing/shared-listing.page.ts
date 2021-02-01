import { Component, OnInit } from "@angular/core";
import { Router } from '@angular/router';
import { ActionSheetController, IonRouterOutlet, ModalController, ToastController, ViewWillEnter } from "@ionic/angular";
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import { APP_URL, LOADING_ITEMS } from 'src/app/config/configuration';
import { ICONS } from 'src/app/config/icons';
import { FormulaModel } from "src/app/core/models/formula.model";
import { IngredientModel } from "src/app/core/models/ingredient.model";
import { ProductionModel } from "src/app/core/models/production.model";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { IngredientCRUDService } from "src/app/core/services/firebase/ingredient.service";
import { ProductionCRUDService } from "src/app/core/services/firebase/production.service";
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
  ingredients: IngredientModel[] & ShellModel;

  user_email: string;

  constructor(
    private modalController: ModalController,
    private languageService: LanguageService,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController,
    private ingredientService: IngredientService,
    private ingredientCRUDService: IngredientCRUDService,
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    private productionService: ProductionService,
    private productionCRUDService: ProductionCRUDService,
    private userStorageService: UserStorageService,
    private router: Router,
    private routerOutlet: IonRouterOutlet
  ) { }
  
  async ngOnInit() {
    this.searchQuery = "";
    this.searchingState(this.segment);

    this.user_email = (await this.userStorageService.getUser()).email;

    if (!this.ingredientService.getIngredients()) {
      this.ingredientCRUDService
        .getIngredientsDataSource(this.user_email)
        .subscribe((ingredients) => {
          this.ingredientService.setIngredients(
            ingredients as IngredientModel[] & ShellModel
          );
        });
    }
    if (!this.productionService.getProductions()) {
      this.productionCRUDService
        .getProductionsDataSource(this.user_email)
        .subscribe((productions) => {
          this.productionService.setProductions(
            productions as ProductionModel[] & ShellModel
          );
        });
    }
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

  ionViewWillEnter() {
    if (this.formulaService.getFormulas()) {
      this.searchingState(this.segment);
      this.searchList();
    }
  }

  searchList() {
    let filtered = [];
    if (this.segment == "ingredients") {
      filtered = JSON.parse(
        JSON.stringify(this.ingredientService.getIngredients())
      );
    }
    if (this.segment == "formulas") {
      filtered = JSON.parse(
        JSON.stringify(this.formulaService.getFormulas())
      );
    }
    if (this.segment == "productions") {
      filtered = JSON.parse(
        JSON.stringify(this.productionService.getProductions())
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
        this.ingredients = this.ingredientService.sortIngredients(value);
      }
      if (this.segment == "formulas") {
        this.formulas = this.formulaService.sortFormulas(value);
      }
      if (this.segment == "productions") {
        this.productions = this.productionService.sortProductions(value);
      }
    });
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.searchList();
  }

  searchingState(segment: string) {
    if (segment == "ingredients") {
      let searchingShellModel: IngredientModel[] &
        ShellModel = [] as IngredientModel[] & ShellModel;
      for (let index = 0; index < LOADING_ITEMS; index++) {
        searchingShellModel.push(new IngredientModel());
      }
      searchingShellModel.isShell = true;
      this.ingredients = searchingShellModel;
      return searchingShellModel;
    }
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
    if (segment == "productions") {
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
        text: this.languageService.getTerm("action.sync_shared"),
        icon: ICONS.sync,
        cssClass: "action-icon",
        handler: () => {
            this.syncShared(type, item)
        },
      },
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

  async syncShared(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    if (type == "ingredient") {
      this.ingredientCRUDService.getSharedIngredients(item.id)
        .subscribe((shared_ingredients) => {
          shared_ingredients.forEach(async (shared_ingredient, index) => {
            let updated_ingredient: IngredientModel;
            updated_ingredient = JSON.parse(JSON.stringify(item));
            updated_ingredient.id = shared_ingredient.id;
            updated_ingredient.user = shared_ingredient.user;
            this.ingredientCRUDService.updateIngredient(updated_ingredient)
              .then(() => {
                this.presentToast(true, updated_ingredient.user.owner)
              })
              .catch(() => {
                this.presentToast(false, updated_ingredient.user.owner)
              })
          })
        });
    }
    if (type == "formula") {
      this.formulaCRUDService.getSharedFormulas(item.id)
        .subscribe((shared_formulas) => {
          shared_formulas.forEach(async (shared_formula, index) => {
            let updated_formula: FormulaModel;
            updated_formula = JSON.parse(JSON.stringify(item));
            updated_formula.id = shared_formula.id;
            updated_formula.user = shared_formula.user;
            this.formulaCRUDService.updateFormula(updated_formula)
              .then(() => {
                this.presentToast(true, updated_formula.user.owner)
              })
              .catch(() => {
                this.presentToast(false, updated_formula.user.owner)
              })
          })
        });
    }
    if (type == "production") {
      this.productionCRUDService.getSharedProductions(item.id)
        .subscribe((shared_productions) => {
          shared_productions.forEach(async (shared_production, index) => {
            let updated_production: ProductionModel;
            updated_production = JSON.parse(JSON.stringify(item));
            updated_production.id = shared_production.id;
            updated_production.user = shared_production.user;
            this.productionCRUDService.updateProduction(updated_production)
              .then(() => {
                this.presentToast(true, updated_production.user.owner)
              })
              .catch(() => {
                this.presentToast(false, updated_production.user.owner)
              })
          })
        });
    }
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
  }

  details(
    type: "ingredient" | "formula" | "production",
    item: IngredientModel | FormulaModel | ProductionModel
  ) {
    if (item.name !== undefined) {
      if (type == "ingredient") {
        this.router.navigateByUrl(
          APP_URL.menu.name +
            "/" +
            APP_URL.menu.routes.ingredient.main +
            "/" +
            APP_URL.menu.routes.ingredient.routes.details,
          {
            state: { ingredient: item },
          }
        );
      }
      if (type == "formula") {
        this.router.navigateByUrl(
          APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.formula.main +
          "/" +
          APP_URL.menu.routes.formula.routes.details,
          {
            state: { formula: item },
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
            state: { production: item },
          }
        );
      }
    }
  }
}

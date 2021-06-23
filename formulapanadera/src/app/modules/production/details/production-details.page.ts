import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController, AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController } from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { DECIMALS } from "src/app/config/formats";
import { ICONS } from "src/app/config/icons";
import {
  FormulaNumberModel,
  FormulaPresentModel,
  ProductionModel,
} from "src/app/core/models/production.model";
import { UserGroupModel, UserResumeModel } from "src/app/core/models/user.model";
import { ProductionCRUDService } from 'src/app/core/services/firebase/production.service';
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { LanguageService } from "src/app/core/services/language.service";
import { ProductionInProcessStorageService } from "src/app/core/services/storage/production-in-process.service";
import { SettingsStorageService } from "src/app/core/services/storage/settings.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { UserGroupPickerModal } from "src/app/shared/modal/user-group/user-group-picker.modal";

@Component({
  selector: "app-production-details",
  templateUrl: "production-details.page.html",
  styleUrls: ["./styles/production-details.page.scss",
    "./../../../shared/styles/note.alert.scss",
    "./../../../shared/styles/confirm.alert.scss",]
})
export class ProductionDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  showIngredients: boolean;
  showDetails: boolean;
  showTimes: boolean;

  production: ProductionModel = new ProductionModel();
  original_production: ProductionModel = new ProductionModel();
  formulas: Array<FormulaPresentModel & { show: boolean }>;
  isCourse: boolean = false;

  production_in_process: boolean = false;

  user: UserResumeModel = new UserResumeModel();
  is_modifier: boolean = false

  constructor(
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private settingsStorageService: SettingsStorageService,
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private productionCRUDService: ProductionCRUDService,
    private productionInProcessStorageService: ProductionInProcessStorageService,
    private userStorageService: UserStorageService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private userCRUDService: UserCRUDService
  ) {
    this.showIngredients = true;
    this.showDetails = false;
    this.showTimes = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.production = JSON.parse(JSON.stringify(navParams.production));
        this.original_production = JSON.parse(
          JSON.stringify(navParams.production)
        );
        this.production_in_process = false;
        this.isCourse = navParams.isCourse ? navParams.isCourse : false;
      }

      this.calculateFormulas();

      let existing_production = await this.productionInProcessStorageService.getProduction();
      if (
        existing_production &&
        this.production.id !== existing_production.production.id
      ) {
        this.production_in_process = true;
      }
      let user = await this.userStorageService.getUser();
      this.user = {name: user.name, email: user.email}
      this.is_modifier = false;
      this.production.user.modifiers.forEach((user) => {
        if (user.email == this.user.email) {
          this.is_modifier = true;
        }
      });
    });
  }

  calculateFormulas() {
    this.formulas = [];
    this.production = JSON.parse(JSON.stringify(this.original_production));
    let presentFormula: FormulaPresentModel;
    this.production.formulas.forEach((formula) => {
      presentFormula = this.calculateFormula(formula);
      this.formulas.push({ ...presentFormula, show: false });
    });
  }

  calculateFormula(initial_formula: FormulaNumberModel): FormulaPresentModel {
    let transformed_formula: FormulaPresentModel;
    transformed_formula = {
      ...initial_formula,
      bakers_percentage: null,
      total_cost: null,
      unitary_cost: null,
      ingredients_formula: [],
    };
    transformed_formula.bakers_percentage = this.formulaService.calculateBakersPercentage(
      initial_formula.number * initial_formula.formula.unit_weight,
      transformed_formula.formula.ingredients
    );
    let total_weight = Number(
      (initial_formula.number * initial_formula.formula.unit_weight).toFixed(
        DECIMALS.weight
      )
    );
    let formula_without_compound = this.formulaService.getFormulaWithoutCompoundIngredients(transformed_formula.formula);
    let bakers_p = formula_without_compound.bakers_percentage
    transformed_formula.total_cost = this.formulaService.calculateTotalCost(
      formula_without_compound.formula.ingredients,
      Number(bakers_p)
    );
    transformed_formula.unitary_cost = (
      Number(transformed_formula.total_cost) / initial_formula.number
    ).toString();

    transformed_formula.ingredients_formula = []
    let ing_formula = [];
    //Identifies ingredients with formula
    this.formulaService.getIngredientsWithFormula(
      transformed_formula.formula.ingredients,
      ing_formula
    );
    this.formulaService.getAllIngredientsWithFormula(
      Number(transformed_formula.bakers_percentage),
      transformed_formula.formula.ingredients,
      ing_formula,
      transformed_formula.ingredients_formula
    )

    initial_formula.formula.steps.forEach((step) => {
      ing_formula = [];
      if (step.ingredients) {
        step.ingredients.forEach((ingredient) => {
          if (ingredient.ingredient.formula) {
            ing_formula.push(ingredient);
          }
        });
        this.formulaService.getIngredientsCalculatedPercentages(
          Number(total_weight),
          Number(transformed_formula.bakers_percentage),
          step.ingredients,
          ing_formula,
          "ADD",
          transformed_formula.ingredients_formula
        );
      }
    });

    initial_formula.formula.steps.forEach((item) => {
      if (item.ingredients) {
        item.ingredients = this.formulaService.sortIngredients(
          item.ingredients
        );
      }
    });
    transformed_formula.ingredients_formula.forEach((item) => {
      item.ingredient.formula.ingredients = this.formulaService.sortIngredients(
        item.ingredient.formula.ingredients
      );
    });
    transformed_formula.formula.ingredients = this.formulaService.sortIngredients(
      transformed_formula.formula.ingredients
    );

    return transformed_formula;
  }

  async presentOptions() {
    let current_user = this.user.email;
    let buttons = [];
    if (!this.isCourse) {
      if (
        this.production.user.owner == current_user
      ) {
        buttons.push({
          text: this.languageService.getTerm("action.update"),
          icon: ICONS.create,
          cssClass: "action-icon",
          handler: () => {
            this.updateProduction();
          },
        });
      }
      if (
        this.production.user.owner == current_user && (this.is_modifier || this.production.user.creator.email == current_user)
      ) {
        buttons.push({
          text: this.languageService.getTerm("action.share"),
          icon: ICONS.share,
          cssClass: "action-icon",
          handler: () => {
            this.shareProduction();
          },
        });
      }
    }
    if (this.production.user.owner == current_user || this.production.user.can_clone) {
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: ICONS.clone,
        cssClass: "action-icon",
        handler: () => {
          this.cloneProductionAlert();
        },
      });
    }
    if (!this.isCourse && this.production.user.owner == current_user) {
      buttons.push({
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
        handler: () => {
          this.deleteProduction();
        },
      });
    }
    buttons.push(
      {
        text: this.languageService.getTerm("action.cancel"),
        icon: ICONS.close,
        role: "cancel",
        cssClass: "cancel-icon",
        handler: () => {},
      }
    );
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: buttons
    });
    await actionSheet.present();
  }

  updateProduction() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.management,
      {
        state: { production: JSON.parse(JSON.stringify(this.original_production)) },
      }
    );
  }

  async shareProduction() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.share"),
      message: this.languageService.getTerm("formulas.share.options.instructions"),
      cssClass: "alert share-alert",
      inputs: [
        {
          name: 'can_clone',
          type: 'checkbox',
          label: this.languageService.getTerm("formulas.can_clone"),
          value: 'can_clone',
          checked: this.production.user.can_clone
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("formulas.share.options.one"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            let can_clone: boolean = data && data.length > 0 && data[0] == "can_clone"
            this.shareOne(can_clone)
          },
        },
        {
          text: this.languageService.getTerm("formulas.share.options.group"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            let can_clone: boolean = data && data.length > 0 && data[0] == "can_clone"
            this.shareGroup(can_clone)
          },
        },
      ],
    });
    await alert.present();
  }

  async shareOne(can_clone: boolean) {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.share"),
      message: this.languageService.getTerm("formulas.share.instructions"),
      cssClass: "alert share-alert",
      inputs: [
        {
          name: "email",
          type: "email",
          placeholder: this.languageService.getTerm("input.email"),
        },
      ],
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: (data) => {
            this.userCRUDService.getUser(data.email)
              .then((user) => {
                this.shareProductionToEmail([{name: user.name, email: user.email}], can_clone)
              }).catch(() => {
                this.presentToast(false);
              })
          },
        },
      ],
    });
    await alert.present();
  }
  
  async shareGroup(can_clone: boolean) {
    const modal = await this.modalController.create({
      component: UserGroupPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();

    if (data !== undefined) {
      let user_groups: UserGroupModel[] = data.user_groups as UserGroupModel[]
      let users: UserResumeModel[] = [];
      user_groups.forEach(group => {
        group.users.forEach(user => {
          users.push(user)
        })
      })
      users = [...new Set(users)];
      this.shareProductionToEmail(users, can_clone, true)
    }
  }
  
  shareProductionToEmail(users_to_share: UserResumeModel[], can_clone: boolean, toast: boolean = true) {
    let shared: boolean = false

    this.production.user.can_clone = can_clone;

    if (this.production.user.shared_references && this.production.user.shared_references.length > 0) {
      users_to_share.forEach((newUser) => {
        shared = false;
        this.production.user.shared_references.forEach(user => {
          if (user == newUser.email) {
            shared = true
          }
        })
        if (shared == false && newUser.email !== this.user.email) {
          this.production.user.shared_users.push(newUser);
          this.production.user.shared_references.push(newUser.email);
        }
      })
    } else {
      this.production.user.shared_users = users_to_share;
      this.production.user.shared_references = [];
      users_to_share.forEach(user => {
        this.production.user.shared_references.push(user.email);
      })
    }
    this.original_production.user = this.production.user;

    this.productionCRUDService
      .update(this.production, this.production)
      .then(() => {
        if (toast) {
          this.presentToast(true);
        }
      })
      .catch(() => {
        this.presentToast(false);
      });
  }

  async cloneProductionAlert() {
    let settings = await this.settingsStorageService.getSettings();
    if (settings.clone_alert) {
      const alert = await this.alertController.create({
        header: this.languageService.getTerm("action.clone"),
        message: this.languageService.getTerm("formulas.clone.instructions"),
        cssClass: "alert clone-alert",
        inputs: [
          {
            name: 'repeat',
            type: 'checkbox',
            label: this.languageService.getTerm("action.stop_alert"),
            value: 'repeat',
          },
        ],
        buttons: [
          {
            text: this.languageService.getTerm("action.cancel"),
            role: "cancel",
            handler: () => { },
          },
          {
            text: this.languageService.getTerm("action.ok"),
            cssClass: "confirm-alert-accept",
            handler: (data) => {
              let repeat: boolean = data && data.length > 0 && data[0] == "repeat";
              settings.clone_alert = !repeat;
              this.settingsStorageService.setSettings(settings);
              this.cloneProduction();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.cloneProduction();
    }
  }

  async cloneProduction() {
    let production: ProductionModel = JSON.parse(JSON.stringify(this.production));
    delete(production.id)
    production.user.owner = this.user.email;
    production.user.public = false;
    production.user.reference = this.production.id;
    production.user.shared_references = [];
    production.user.shared_users = [];
    production.name = `${
      this.production.name
    } (${this.languageService.getTerm("action.copy")})`;
    this.productionCRUDService.create(production).then(() => {
      this.router.navigateByUrl(
        APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
      );
    });
  }

  startProduction() {
    if (!this.production_in_process) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.start,
        {
          state: {
            production: JSON.parse(JSON.stringify(this.production)),
            formulas: JSON.parse(JSON.stringify(this.formulas))
          },
        }
      );
    }
  }

  async deleteProduction() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.production.name,
      }),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: async () => {
            const loading = await this.loadingController.create({
              cssClass: "app-send-loading",
              message: this.languageService.getTerm("loading"),
            });
            await loading.present();

            this.productionCRUDService
              .delete(this.production)
              .then(async () => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
                )
              })
              .catch(() => {
                this.presentToast(false);
              })
              .finally(async () => {
                await loading.dismiss();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(success: boolean) {
    let message = "";
    if (success) {
      message = message + this.languageService.getTerm("formulas.share.success")
    } else {
      message = message + this.languageService.getTerm("formulas.share.error")
    }
    const toast = await this.toastController.create({
      message: message,
      color: "secondary",
      duration: 5000,
      position: "bottom",
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

  async changeProduction(type: 'public' | 'clone', value: any) {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    if (type == 'public') {
      this.production.user.public = value;
    } else {
      this.production.user.can_clone = value
    }
    this.productionCRUDService
      .update(this.production, this.production)
      .then(() => {})
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }
}

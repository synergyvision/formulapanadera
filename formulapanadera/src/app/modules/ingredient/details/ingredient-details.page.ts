import { Component, OnInit } from "@angular/core";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController, AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserGroupModel, UserModel, UserResumeModel } from "src/app/core/models/user.model";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { DECIMAL_COST_FORMAT } from "src/app/config/formats";
import { IngredientCRUDService } from 'src/app/core/services/firebase/ingredient.service';
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { UserGroupPickerModal } from "src/app/shared/modal/user-group/user-group-picker.modal";
import { FormulaService } from "src/app/core/services/formula.service";
import { UserCRUDService } from "src/app/core/services/firebase/user.service";
import { SettingsStorageService } from "src/app/core/services/storage/settings.service";
import { UserService } from "src/app/core/services/user.service";

@Component({
  selector: "app-ingredient-details",
  templateUrl: "./ingredient-details.page.html",
  styleUrls: [
    "./styles/ingredient-details.page.scss",
    "./../../../shared/styles/note.alert.scss",
    "./../../../shared/styles/confirm.alert.scss"
  ],
})
export class IngredientDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  ingredient: IngredientModel = new IngredientModel();
  ingredients_formula: IngredientPercentageModel[] = [];
  isCourse: boolean = false;
  type: string = "simple";

  currency = CURRENCY;
  INGREDIENT_COST_FORMAT = DECIMAL_COST_FORMAT.ingredient;

  showIngredients: boolean;
  showMixing: boolean;
  showReferences: boolean;

  user: UserModel = new UserModel();
  is_modifier: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private languageService: LanguageService,
    private settingsStorageService: SettingsStorageService,
    private userStorageService: UserStorageService,
    private ingredientCRUDService: IngredientCRUDService,
    private formulaService: FormulaService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private userCRUDService: UserCRUDService,
    private userService: UserService
  ) {
    this.showIngredients = true;
    this.showMixing = false;
    this.showReferences = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      this.type = "simple";
      this.ingredients_formula = []
      let ing_formula: IngredientPercentageModel[] = [];
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.ingredient = navParams.ingredient;
        this.isCourse = navParams.isCourse ? navParams.isCourse : false;
      }

       if (this.ingredient.formula) {
        this.type = "compound";
        //Identifies ingredients with formula
        this.formulaService.getIngredientsWithFormula(
          this.ingredient.formula.ingredients,
          ing_formula
        );
        this.formulaService.getAllIngredientsWithFormula(
          0,
          this.ingredient.formula.ingredients,
          ing_formula,
          this.ingredients_formula
        )
      }
      this.user = await this.userStorageService.getUser();
      this.is_modifier = false;
      this.ingredient.user.modifiers.forEach((user) => {
        if (user.email == this.user.email) {
          this.is_modifier = true;
        }
      });
    });
  }

  async presentOptions() {
    let current_user = this.user.email;
    let buttons = [];
    if (!this.isCourse) {
      // PERMISSION: INGREDIENT MANAGE (UPDATE)
      if (
        this.ingredient.user.owner == current_user &&
        this.userService.hasPermission(this.user.role, [{ name: 'INGREDIENT', type: 'MANAGE' }])
      ) {
        buttons.push(
          {
            text: this.languageService.getTerm("action.update"),
            icon: ICONS.create,
            cssClass: "action-icon",
            handler: () => {
              this.updateIngredient();
            },
          }
        );
      }
      // PERMISSION: SHARE MANAGE
      if (
        this.ingredient.user.owner == current_user && (this.is_modifier || this.ingredient.user.creator.email == current_user) &&
        this.userService.hasPermission(this.user.role, [{ name: 'SHARE', type: 'MANAGE' }])
      ) {
        buttons.push(
          {
            text: this.languageService.getTerm("action.share"),
            icon: ICONS.share,
            cssClass: "action-icon",
            handler: () => {
              this.shareIngredient();
            },
          }
        );
      }
    }
    if (this.ingredient.user.owner == current_user || this.ingredient.user.can_clone) {
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: ICONS.clone,
        cssClass: "action-icon",
        handler: () => {
          this.cloneIngredientAlert();
        },
      });
    }
    // PERMISSION: INGREDIENT MANAGE (DELETE)
    if (
      !this.isCourse && this.ingredient.user.owner == current_user &&
      this.userService.hasPermission(this.user.role, [{ name: 'INGREDIENT', type: 'MANAGE' }])
    ) {
      buttons.push({
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
        handler: () => {
          this.deleteIngredient();
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

  updateIngredient() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.ingredient.main +
        "/" +
        APP_URL.menu.routes.ingredient.routes.management,
      {
        state: { ingredient: JSON.parse(JSON.stringify(this.ingredient)) },
      }
    );
  }

  async shareIngredient() {
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
          checked: this.ingredient.user.can_clone
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
                if (!user.role) {
                  this.presentToast(false, this.languageService.getTerm("send.user_error"));
                } else {
                  if (this.userService.hasPermission(user.role, [{ name: 'SHARE', type: 'MANAGE' }])) {
                    this.shareIngredientToEmail([{ name: user.name, email: user.email }], can_clone)
                  } else {
                    this.presentToast(false, this.languageService.getTerm("send.user_unauthorized_error", { version: 'SOCIAL' }));
                  }
                }
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
      this.shareIngredientToEmail(users, can_clone, true)
    }
  }
  
  shareIngredientToEmail(users_to_share: UserResumeModel[], can_clone: boolean, toast: boolean = true) {
    let shared: boolean = false

    this.ingredient.user.can_clone = can_clone;

    if (this.ingredient.user.shared_references && this.ingredient.user.shared_references.length > 0) {
      users_to_share.forEach((newUser) => {
        shared = false;
        this.ingredient.user.shared_references.forEach(user => {
          if (user == newUser.email) {
            shared = true
          }
        })
        if (shared == false && newUser.email !== this.user.email) {
          this.ingredient.user.shared_users.push(newUser);
          this.ingredient.user.shared_references.push(newUser.email);
        }
      })
    } else {
      this.ingredient.user.shared_users = users_to_share;
      this.ingredient.user.shared_references = [];
      users_to_share.forEach(user => {
        this.ingredient.user.shared_references.push(user.email);
      })
    }

    this.ingredientCRUDService
      .update(this.ingredient, this.ingredient)
      .then(() => {
        if (toast) {
          this.presentToast(true);
        }
      })
      .catch(() => {
        this.presentToast(false);
      });
  }

  async cloneIngredientAlert() {
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
              this.cloneIngredient();
            },
          },
        ],
      });
      await alert.present();
    } else {
      this.cloneIngredient();
    }
  }

  async cloneIngredient() {
    let ingredient: IngredientModel = JSON.parse(JSON.stringify(this.ingredient));
    delete (ingredient.id)
    ingredient.user.owner = this.user.email;
    ingredient.user.public = false;
    ingredient.user.reference = this.ingredient.id;
    ingredient.user.shared_references = [];
    ingredient.user.shared_users = [];
    ingredient.name = `${this.ingredient.name
      } (${this.languageService.getTerm("action.copy")})`;
    this.ingredientCRUDService.create(ingredient).then(() => {
      this.router.navigateByUrl(
        APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
      );
    });
  }

  getProportionFactor(): string {
    if (this.ingredient.formula.proportion_factor.factor == "dough") {
      return this.languageService.getTerm(
        "ingredients.proportion_factor.dough"
      );
    } else if (this.ingredient.formula.proportion_factor.factor == "flour") {
      return this.languageService.getTerm(
        "ingredients.proportion_factor.flour"
      );
    } else if (
      this.ingredient.formula.proportion_factor.factor == "ingredient"
    ) {
      return this.ingredient.formula.proportion_factor.ingredient.name;
    } else {
      return "";
    }
  }

  async deleteIngredient() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.ingredient.name,
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

            this.ingredientCRUDService
              .delete(this.ingredient)
              .then(async () => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
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

  async presentToast(success: boolean, customMessage?: string) {
    let message = ""
    if (success) {
      message = message + this.languageService.getTerm("formulas.share.success")
    } else {
      message = message + this.languageService.getTerm("formulas.share.error")
    }
    if (customMessage) {
      message = customMessage;
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

  async changeIngredient(type: 'public' | 'clone', value: any) {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    if (type == 'public') {
      this.ingredient.user.public = value;
    } else {
      this.ingredient.user.can_clone = value
    }
    this.ingredientCRUDService
      .update(this.ingredient, this.ingredient)
      .then(() => {})
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }
}

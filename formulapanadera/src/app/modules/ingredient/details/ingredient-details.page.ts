import { Component, OnInit } from "@angular/core";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController, AlertController, IonRouterOutlet, LoadingController, ModalController, ToastController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserGroupModel, UserResumeModel } from "src/app/core/models/user.model";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { DECIMAL_COST_FORMAT } from "src/app/config/formats";
import { IngredientCRUDService } from 'src/app/core/services/firebase/ingredient.service';
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { UserGroupPickerModal } from "src/app/shared/modal/user-group/user-group-picker.modal";
import { FormulaService } from "src/app/core/services/formula.service";

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
  type: string = "simple";

  currency = CURRENCY;
  INGREDIENT_COST_FORMAT = DECIMAL_COST_FORMAT.ingredient;

  showIngredients: boolean;
  showMixing: boolean;

  user: UserResumeModel = new UserResumeModel();
  is_modifier: boolean = false
  public: boolean = false

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private languageService: LanguageService,
    private userStorageService: UserStorageService,
    private ingredientCRUDService: IngredientCRUDService,
    private formulaService: FormulaService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet
  ) {
    this.showIngredients = true;
    this.showMixing = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      this.ingredients_formula = []
      let ing_formula: IngredientPercentageModel[] = [];
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.ingredient = navParams.ingredient;
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
      if (this.ingredient.user.owner == "") {
        this.public = true;
      }
      let user = await this.userStorageService.getUser();
      this.user = {name: user.name, email: user.email}
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
    if (
      this.ingredient.user.cloned ||
      (!this.ingredient.user.cloned &&
        this.ingredient.user.creator.email == current_user)
    ) {
      buttons.push({
        text: this.languageService.getTerm("action.update"),
        icon: ICONS.create,
        cssClass: "action-icon",
        handler: () => {
          this.updateIngredient();
        },
      });
    }
    if (
      this.ingredient.user.owner &&
      ((this.ingredient.user.cloned && this.is_modifier) ||
        this.ingredient.user.creator.email == current_user)
    ) {
      // If not public but is cloned and was modified or user is creator
      buttons.push({
        text: this.languageService.getTerm("action.share"),
        icon: ICONS.share,
        cssClass: "action-icon",
        handler: () => {
          this.shareIngredient();
        },
      });
    }
    if (this.ingredient.user.can_clone || this.ingredient.user.creator.email == current_user) {
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: ICONS.clone,
        cssClass: "action-icon",
        handler: () => {
          this.cloneIngredient();
        },
      });
    }
    if (this.ingredient.user.owner == current_user ||
      (this.ingredient.user.owner == "" &&
        this.ingredient.user.creator.email == current_user)) {
      // If not public or cloned
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
        state: { ingredient: this.ingredient },
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
            this.shareIngredientToEmail({name: "----", email: data.email}, can_clone)
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
      users.forEach(user => {
        this.shareIngredientToEmail(user, can_clone, true)
      })
    }
  }
  
  shareIngredientToEmail(user_to_share: UserResumeModel, can_clone: boolean, toast: boolean = true) {
    let shared: boolean = false

    let ingredient = JSON.parse(JSON.stringify(this.ingredient));
    ingredient.user.can_clone = can_clone;
    ingredient.user.owner = user_to_share.email;
    ingredient.user.cloned = false;
    ingredient.user.reference = this.ingredient.id;
    ingredient.user.shared_users = [];

    if (this.ingredient.user.shared_users && this.ingredient.user.shared_users.length > 0) {
      this.ingredient.user.shared_users.forEach(user => {
        if (user.email == user_to_share.email) {
          shared = true
        }
      })
      if (shared == false) {
        this.ingredient.user.shared_users.push(user_to_share);
      }
    } else {
      this.ingredient.user.shared_users.push(user_to_share);
    }

    if (user_to_share.email == this.user.email) {
      shared = true
    }

    if (shared == false) {
      delete(ingredient.id)
      this.ingredientCRUDService
        .createIngredient(ingredient)
        .then(() => {
          this.ingredientCRUDService
            .updateIngredient(this.ingredient)
            .then(() => {
              if (toast) {
                this.presentToast(true, user_to_share.email);
              }
            })
            .catch(() => {
              this.presentToast(false, user_to_share.email);
            });
        })
        .catch(() => {
          this.presentToast(false, user_to_share.email);
        });
    } else {
      this.presentToast(false, user_to_share.email);
    }
  }

  async cloneIngredient() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.clone"),
      message: this.languageService.getTerm("formulas.clone.instructions"),
      cssClass: "alert clone-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            let ingredient = JSON.parse(JSON.stringify(this.ingredient));
            delete(ingredient.id)
            ingredient.user.owner = this.user.email;
            ingredient.user.cloned = true;
            ingredient.user.reference = "";
            ingredient.name = `${
              this.ingredient.name
            } (${this.languageService.getTerm("action.copy")})`;
            this.ingredientCRUDService.createIngredient(ingredient).then(() => {
              this.router.navigateByUrl(
                APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
              );
            });
          },
        },
      ],
    });
    await alert.present();
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
              .deleteIngredient(this.ingredient)
              .then(async () => {
                if (this.ingredient.user.reference) {
                  let original_ingredient = await this.ingredientCRUDService.getIngredient(this.ingredient.user.reference)
                  original_ingredient.user.shared_users.forEach((user) => {
                    if (user.email == this.user.email) {
                      original_ingredient.user.shared_users.splice(original_ingredient.user.shared_users.indexOf(user), 1)
                    }
                  })
                  this.ingredientCRUDService.updateIngredient(original_ingredient)
                    .then(() => {
                      this.router.navigateByUrl(
                        APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
                      )
                    })
                } else {
                  this.router.navigateByUrl(
                    APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
                  )
                }
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

  async presentToast(success: boolean, email?: string) {
    let message = ""
    message = `${email}: `;
    if (success) {
      message = message + this.languageService.getTerm("formulas.share.success")
    } else {
      message = message + this.languageService.getTerm("formulas.share.error")
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
      if (value) {
        this.ingredient.user.owner = "";
        this.ingredient.user.cloned = false;
      } else {
        this.ingredient.user.owner = this.user.email;
      }
    } else {
      this.ingredient.user.can_clone = value
    }
    this.ingredientCRUDService
      .updateIngredient(this.ingredient)
      .then(() => {})
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  returnToList() {
    this.router.navigateByUrl(
      APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
    );
  }
}

import { Component, OnInit, NgZone } from "@angular/core";
import {
  AlertController,
  ModalController,
  IonRouterOutlet,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { Validators, FormGroup, FormControl } from "@angular/forms";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { IngredientCRUDService } from "../../../core/services/firebase/ingredient.service";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { IngredientMixingModal } from "src/app/shared/modal/mixing/ingredient-mixing.modal";
import { FormulaService } from "src/app/core/services/formula.service";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { UserModel } from "src/app/core/models/user.model";
import { IngredientService } from "src/app/core/services/ingredient.service";

@Component({
  selector: "app-ingredient-manage",
  templateUrl: "./ingredient-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/ingredient-manage.page.scss",
  ],
})
export class IngredientManagePage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  ingredient: IngredientModel = new IngredientModel();
  manageIngredientForm: FormGroup;
  update: boolean = false;
  public = false;
  type: string = "simple";

  currency = CURRENCY;

  user: UserModel = new UserModel();

  constructor(
    private ingredientCRUDService: IngredientCRUDService,
    private ingredientService: IngredientService,
    private userStorageService: UserStorageService,
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public modalController: ModalController,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet,
    private router: Router,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      delete this.ingredient.formula;
      this.manageIngredientForm = new FormGroup({
        name: new FormControl("", Validators.required),
        hydration: new FormControl("", Validators.required),
        is_flour: new FormControl(false, Validators.required),
        cost: new FormControl("", Validators.required),
      });
    } else {
      this.update = true;
      this.ingredient = state.ingredient;
      if (this.ingredient.formula) {
        this.type = "compound";
      }
      this.manageIngredientForm = new FormGroup({
        name: new FormControl(state.ingredient.name, Validators.required),
        hydration: new FormControl(
          state.ingredient.hydration,
          Validators.required
        ),
        is_flour: new FormControl(
          state.ingredient.is_flour,
          Validators.required
        ),
        cost: new FormControl(state.ingredient.cost, Validators.required),
      });
      this.public = this.ingredient.can_be_modified;
    }

    this.user = await this.userStorageService.getUser();
  }

  async pickIngredient() {
    const modal = await this.modalController.create({
      component: IngredientPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: this.ingredient.formula.ingredients,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      if (this.ingredient.formula.ingredients == null) {
        this.ingredient.formula.ingredients = [];
      }
      this.ingredient.formula.ingredients = data.ingredients;
      this.ingredient.formula.mixing = undefined;
    }
  }

  async mixIngredients() {
    let mixedIngredients = [
      {
        ingredients: [],
        description: "",
      },
    ];
    if (!this.ingredient.formula.mixing) {
      this.ingredient.formula.ingredients.forEach(
        (ingredient: IngredientPercentageModel) =>
          mixedIngredients[0].ingredients.push(ingredient)
      );
    } else {
      mixedIngredients = this.ingredient.formula.mixing;
    }
    const modal = await this.modalController.create({
      component: IngredientMixingModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        formulaMixing: mixedIngredients,
        editable: true,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.ingredient.formula.mixing = data;
    }
  }

  deleteSelectedIngredient(ingredient: IngredientPercentageModel) {
    this.ingredient.formula.ingredients.splice(
      this.ingredient.formula.ingredients.indexOf(ingredient),
      1
    );
  }

  canSend() {
    return (
      (!this.manageIngredientForm.valid && this.type == "simple") ||
      (this.ingredient.formula &&
        !(
          this.manageIngredientForm.value.name &&
          this.ingredient.formula.proportion_factor.factor &&
          this.ingredient.formula.ingredients &&
          this.ingredientsAreValid() &&
          this.ingredient.formula.mixing
        ))
    );
  }

  formatSuggestedValues(type: string, value: number) {
    if (type == "min") {
      this.ingredient.formula.suggested_values.min = Number(
        this.formatNumberService.formatNumberDecimals(value, 0)
      );
    } else {
      this.ingredient.formula.suggested_values.max = Number(
        this.formatNumberService.formatNumberDecimals(value, 0)
      );
    }
  }

  async sendIngredient() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    this.ingredient.name = this.manageIngredientForm.value.name;
    this.ingredient.can_be_modified = this.public;

    if (!this.ingredient.formula) {
      this.ingredient.hydration = this.manageIngredientForm.value.hydration;
      this.ingredient.is_flour = this.manageIngredientForm.value.is_flour;
      this.ingredient.cost = this.manageIngredientForm.value.cost;
    } else {
      this.ingredient.hydration = Number(
        this.formulaService.calculateHydration(
          this.ingredient.formula.ingredients
        )
      );
      this.ingredient.is_flour = false;
      this.ingredient.cost = null;
      if (!this.ingredient.formula.compensation_percentage) {
        this.ingredient.formula.compensation_percentage = 0;
      }
    }

    let ingredients = this.ingredientService.getIngredients();
    let ingredient_exists = false;
    if (ingredients) {
      ingredients.forEach((ingredient) => {
        if (ingredient.name == this.ingredient.name) {
          ingredient_exists = true;
        }
      });
    }
    if (ingredient_exists) {
      loading.dismiss();
      this.presentToast(false, true);
    } else {
      if (!this.update) {
        this.ingredient.creator = this.user.email;
        this.ingredientCRUDService
          .createIngredient(this.ingredient)
          .then(() => {
            this.router.navigateByUrl(
              APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
            );
          })
          .catch(() => {
            this.presentToast(false);
          })
          .finally(async () => {
            await loading.dismiss();
          });
      } else {
        this.ingredientCRUDService
          .updateIngredient(this.ingredient)
          .then(() => {
            this.router.navigateByUrl(
              APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
            );
          })
          .catch(() => {
            this.presentToast(false);
          })
          .finally(async () => {
            await loading.dismiss();
          });
      }
    }
  }

  async deleteIngredient() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.manageIngredientForm.value.name,
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
              .deleteIngredient(this.ingredient.id)
              .then(() => {
                this.ngZone.run(() =>
                  this.router.navigate([
                    APP_URL.menu.name +
                      "/" +
                      APP_URL.menu.routes.ingredient.main,
                  ])
                );
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

  formatNumberPercentage(value: number) {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.0");
    } else {
      this.manageIngredientForm
        .get("hydration")
        .patchValue(this.formatNumberService.formatNumberPercentage(value));
    }
  }

  formatPercentage() {
    if (this.ingredient.formula) {
      this.ingredient.formula.compensation_percentage = Number(
        this.formatNumberService.formatNumberPercentage(
          this.ingredient.formula.compensation_percentage
        )
      );
    }
  }

  formatDecimals(item: IngredientPercentageModel) {
    item.percentage = Number(
      this.formatNumberService.formatNumberDecimals(item.percentage)
    );
  }

  changeFlourIngredient() {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.0");
    }
  }

  async pickProportionIngredient() {
    const modal = await this.modalController.create({
      component: IngredientPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: undefined,
        limit: 1,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.ingredient.formula.proportion_factor.ingredient = {
        id: data.ingredients[0].ingredient.id,
        name: data.ingredients[0].ingredient.name,
      };
    }
  }

  async changeProportionFactor() {
    if (this.ingredient.formula.proportion_factor.factor == "ingredient") {
      await this.pickProportionIngredient();
    } else {
      this.ingredient.formula.proportion_factor.ingredient = null;
    }
  }

  changeType(ev: any) {
    this.type = ev.detail.value;
    if (this.type == "compound") {
      this.ingredient.formula = {
        ingredients: [],
        mixing: [],
        compensation_percentage: 0,
        proportion_factor: { factor: "dough" },
        suggested_values: {
          min: 0,
          max: 0,
        },
      };
    } else {
      delete this.ingredient.formula;
    }
  }

  ingredientsAreValid() {
    let valid = true;
    if (this.ingredient.formula.ingredients) {
      this.ingredient.formula.ingredients.forEach((ingredient) => {
        if (ingredient.percentage <= 0) {
          valid = false;
        }
      });
    }
    return valid;
  }

  async presentToast(success: boolean, exists: boolean = false) {
    const toast = await this.toastController.create({
      message: exists
        ? this.languageService.getTerm("send.exists")
        : success
        ? this.languageService.getTerm("send.success")
        : this.languageService.getTerm("send.error"),
      color: "secondary",
      duration: 5000,
      position: "top",
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
}

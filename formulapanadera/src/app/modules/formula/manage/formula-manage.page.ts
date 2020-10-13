import { Component } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ModalController,
  IonRouterOutlet,
  AlertController,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import {
  IngredientPercentageModel,
  FormulaModel,
  StepDetailsModel,
} from "src/app/core/models/formula.model";
import { FormulaStepsModal } from "src/app/shared/modal/steps/formula-steps.modal";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { LanguageService } from "src/app/core/services/language.service";
import { Router } from "@angular/router";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { IngredientMixingModal } from "src/app/shared/modal/mixing/ingredient-mixing.modal";
import { BAKERY_STEPS } from "src/app/config/formula";
import { FormulaCRUDService } from "src/app/core/services/firebase/formula.service";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserModel } from "src/app/core/models/user.model";

@Component({
  selector: "app-formula-manage",
  templateUrl: "formula-manage.page.html",
  styleUrls: [
    "./styles/formula-manage.page.scss",
    "./../../../shared/styles/confirm.alert.scss",
  ],
})
export class FormulaManagePage {
  APP_URL = APP_URL;
  ICONS = ICONS;

  formula: FormulaModel = new FormulaModel();
  manageFormulaForm: FormGroup;
  formulaUnit = "gr";
  temperatureUnit = "C";
  update: boolean = false;
  public = false;
  current_user = new UserModel();

  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    public modalController: ModalController,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private router: Router,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      this.manageFormulaForm = new FormGroup({
        name: new FormControl(null, Validators.required),
        units: new FormControl(null, Validators.required),
        unit_weight: new FormControl(null, Validators.required),
      });
      this.formula.user = {
        owner: this.current_user.email,
        can_clone: false,
        cloned: true,
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
    } else {
      this.update = true;
      this.formulaUnit = "%";
      this.manageFormulaForm = new FormGroup({
        name: new FormControl(state.formula.name, Validators.required),
        units: new FormControl(state.formula.units, Validators.required),
        unit_weight: new FormControl(
          state.formula.unit_weight,
          Validators.required
        ),
      });
      this.formula.id = state.formula.id;
      this.formula.user = state.formula.user;
      if (this.formula.user.owner == "") {
        this.public = true;
      }
      this.formula.ingredients = [];
      this.formula.mixing = [];
      this.formula.steps = [];
      state.formula.ingredients.forEach((ingredient) => {
        this.formula.ingredients.push(ingredient);
      });
      state.formula.mixing.forEach((ingredient) => {
        this.formula.mixing.push(ingredient);
      });
      state.formula.steps.forEach((ingredient) => {
        this.formula.steps.push(ingredient);
      });
    }
    this.current_user = await this.userStorageService.getUser();
  }

  changeUnit(ev: any) {
    this.formulaUnit = ev.detail.value;
  }

  formatUnits(value: number) {
    this.manageFormulaForm
      .get("units")
      .patchValue(this.formatNumberService.formatNumberDecimals(value, 0));
  }

  formatUnitWeight(value: number) {
    this.manageFormulaForm
      .get("unit_weight")
      .patchValue(this.formatNumberService.formatNumberDecimals(value, 1));
  }

  formatPercentage(ingredient: IngredientPercentageModel) {
    if (this.formulaUnit == "%" || ingredient.ingredient.formula) {
      ingredient.percentage = Number(
        this.formatNumberService.formatNumberPercentage(ingredient.percentage)
      );
    } else {
      ingredient.percentage = Number(
        this.formatNumberService.formatNumberDecimals(ingredient.percentage, 1)
      );
    }
  }

  async ingredientPicker(ingredients: Array<IngredientPercentageModel>) {
    const modal = await this.modalController.create({
      component: IngredientPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: ingredients,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    return data;
  }

  async pickIngredient() {
    let data = await this.ingredientPicker(this.formula.ingredients);
    if (data !== undefined) {
      if (this.formula.ingredients == null) {
        this.formula.ingredients = [];
      }
      this.formula.ingredients = data.ingredients;
      this.formula.mixing = undefined;
    }
  }

  async pickStepIngredient(step: StepDetailsModel) {
    let data = await this.ingredientPicker(step.ingredients);
    if (data !== undefined) {
      if (step.ingredients == null) {
        step.ingredients = [];
      }
      step.ingredients = data.ingredients;
    }
  }

  async mixIngredients() {
    if (this.formula.ingredients) {
      let mixedIngredients = [
        {
          ingredients: [],
          description: "",
        },
      ];
      if (!this.formula.mixing) {
        this.formula.ingredients.forEach(
          (ingredient: IngredientPercentageModel) =>
            mixedIngredients[0].ingredients.push(ingredient)
        );
      } else {
        mixedIngredients = this.formula.mixing;
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
        this.formula.mixing = data;
      }
    }
  }

  async describeSteps() {
    let steps: Array<StepDetailsModel> = [];
    if (!this.formula.steps) {
      for (let i = 0; i < BAKERY_STEPS; i++) {
        steps.push({
          number: i,
          name: this.languageService.getTerm("steps." + (i + 1)),
          time: 0,
          temperature: null,
          description: "",
          times: 1,
        });
      }
    } else {
      steps = this.formula.steps;
    }
    const modal = await this.modalController.create({
      component: FormulaStepsModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        formulaSteps: steps,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.formula.steps = data.steps;
      this.temperatureUnit = data.temperatureUnit;
    }
  }

  deleteIngredient(ingredient: IngredientPercentageModel) {
    this.formula.ingredients.splice(
      this.formula.ingredients.indexOf(ingredient),
      1
    );
  }

  deleteStepIngredient(
    step: StepDetailsModel,
    ingredient: IngredientPercentageModel
  ) {
    step.ingredients.splice(step.ingredients.indexOf(ingredient), 1);
  }

  async sendFormula() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    this.verifyUnit();
    this.verifyTemperature();
    this.formula.name = this.manageFormulaForm.value.name;
    this.formula.units = this.manageFormulaForm.value.units;
    this.formula.unit_weight = this.manageFormulaForm.value.unit_weight;
    if (this.update) {
      let is_modifier = false;
      this.formula.user.modifiers.forEach((user) => {
        if (user.email == this.current_user.email) {
          is_modifier = true;
        }
      });
      if (
        !is_modifier &&
        this.current_user.email !== this.formula.user.creator.email
      ) {
        this.formula.user.modifiers.push({
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        });
      }
      if (this.public) {
        this.formula.user.owner = "";
        this.formula.user.cloned = false;
      } else {
        this.formula.user.owner = this.current_user.email;
      }
      this.formulaCRUDService
        .updateFormula(this.formula)
        .then(() => {
          this.router.navigateByUrl(
            APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
          );
        })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    } else {
      this.formula.user = {
        owner: this.current_user.email,
        can_clone: this.formula.user.can_clone,
        cloned: true,
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
      if (this.public) {
        this.formula.user.owner = "";
        this.formula.user.cloned = false;
      }
      this.formulaCRUDService
        .createFormula(this.formula)
        .then(() => {
          this.router.navigateByUrl(
            APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
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

  async deleteFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.manageFormulaForm.value.name,
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

            this.formulaCRUDService
              .deleteFormula(this.formula.id)
              .then(() => {
                this.router.navigateByUrl(
                  APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main
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

  verifyTemperature() {
    if (this.temperatureUnit == "F") {
      this.formula.steps.forEach((step) => {
        if (step.temperature !== null) {
          step.temperature.min = Number(
            this.formatNumberService.fromFahrenheitToCelsius(
              step.temperature.min
            )
          );
          if (step.temperature.max !== -1) {
            step.temperature.max = Number(
              this.formatNumberService.fromFahrenheitToCelsius(
                step.temperature.max
              )
            );
          }
        }
      });
    }
  }

  verifyUnit() {
    if (this.formulaUnit == "gr") {
      this.formula.ingredients = this.formulaService.fromRecipeToFormula(
        this.formula.ingredients
      );
    }
  }

  ingredientsAreValid() {
    let valid = true;
    if (this.formula.ingredients) {
      this.formula.ingredients.forEach((ingredient) => {
        if (ingredient.percentage <= 0) {
          valid = false;
        }
      });
    }
    return valid;
  }

  async presentToast(success: boolean) {
    const toast = await this.toastController.create({
      message: success
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

import { Component } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ModalController,
  IonRouterOutlet,
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
  original_formula: FormulaModel = new FormulaModel();

  manageFormulaForm: FormGroup;
  formulaUnit = "gr";
  temperatureUnit = "C";
  update: boolean = false;
  public = false;
  current_user = new UserModel();
  is_modifier: boolean = false

  constructor(
    private formulaService: FormulaService,
    private formulaCRUDService: FormulaCRUDService,
    public modalController: ModalController,
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
        description: new FormControl(null, null),
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
        description: new FormControl(state.formula.description, null),
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
      this.original_formula = JSON.parse(JSON.stringify(state.formula))
    }
    this.current_user = await this.userStorageService.getUser();
    if (this.update) {
      this.is_modifier = false;
      this.formula.user.modifiers.forEach((user) => {
        if (user.email == this.current_user.email) {
          this.is_modifier = true;
        }
      });
    }
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
    if (this.formulaUnit == "%") {
      ingredient.percentage = Number(
        this.formatNumberService.formatNumberPercentage(ingredient.percentage)
      );
    } else {
      ingredient.percentage = Number(
        this.formatNumberService.formatNumberDecimals(ingredient.percentage, 1)
      );
    }
  }

  formatStepPercentage(ingredient: IngredientPercentageModel) {
    ingredient.percentage = Number(
      this.formatNumberService.formatNumberDecimals(ingredient.percentage)
    );
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
    let data;
    if (this.formula.ingredients) {
      data = await this.ingredientPicker(JSON.parse(JSON.stringify(this.formula.ingredients)));
    } else {
      data = await this.ingredientPicker(this.formula.ingredients);
    }
    if (data !== undefined) {
      if (this.formula.ingredients == null) {
        this.formula.ingredients = [];
      }
      let new_ingredients: IngredientPercentageModel[] = []
      let deleted_ingredients: IngredientPercentageModel[] = []
      let exists: boolean
      this.formula.ingredients.forEach(prev_ingredient => {
        exists = false
        data.ingredients.forEach((new_ingredient: IngredientPercentageModel) => {
          if (prev_ingredient.ingredient.id == new_ingredient.ingredient.id) {
            exists = true
          }
        })
        if (!exists) {
          deleted_ingredients.push(prev_ingredient)
        }
      })
      data.ingredients.forEach((new_ingredient: IngredientPercentageModel) => {
        exists = false
        this.formula.ingredients.forEach(prev_ingredient => {
          if (prev_ingredient.ingredient.id == new_ingredient.ingredient.id) {
            exists = true
          }
        })
        if (!exists) {
          new_ingredients.push(new_ingredient)
        }
      })
      this.adjustFormulaMixing(new_ingredients, deleted_ingredients)
      this.formula.ingredients = data.ingredients;
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
    this.adjustFormulaMixing([], [ingredient])
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
    this.formula.description = this.manageFormulaForm.value.description;
    
    if (this.update) {
      this.formula.user.modifiers.push({
        name: this.current_user.name,
        email: this.current_user.email,
        date: new Date(),
      });
      if (this.public) {
        this.formula.user.owner = "";
        this.formula.user.cloned = false;
      } else {
        this.formula.user.owner = this.current_user.email;
      }

      let valid: boolean = this.verifyCompoundIngredients()
      if (valid) {
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
        this.presentToast(false);
        await loading.dismiss();
      }
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
        this.formula.ingredients, true
      );
    }
  }

  verifyCompoundIngredients(): boolean {
    let new_compound_ingredients: IngredientPercentageModel[] = []
    let deleted_compound_ingredients: IngredientPercentageModel[] = []
    let exists: boolean
    this.formula.ingredients.forEach((new_ingredient: IngredientPercentageModel) => {
      exists = false
      this.original_formula.ingredients.forEach(prev_ingredient => {
        if (prev_ingredient.ingredient.id == new_ingredient.ingredient.id || !new_ingredient.ingredient.formula) {
          exists = true
        }
      })
      if (!exists) {
        new_compound_ingredients.push(new_ingredient)
      }
    })
    this.original_formula.ingredients.forEach((new_ingredient: IngredientPercentageModel) => {
      exists = false
      this.formula.ingredients.forEach(prev_ingredient => {
        if (prev_ingredient.ingredient.id == new_ingredient.ingredient.id || !new_ingredient.ingredient.formula) {
          exists = true
        }
      })
      if (!exists) {
        deleted_compound_ingredients.push(new_ingredient)
      }
    })

    let bakers_percentage: string
    let new_bakers_percentage: string
    if (deleted_compound_ingredients.length !== 0) {
      new_bakers_percentage = this.formulaService.deleteIngredientsWithFormula(this.original_formula, this.formula)
    }
    if (new_compound_ingredients.length !== 0) {
      if (new_bakers_percentage) {
        bakers_percentage = new_bakers_percentage
      } else {
        bakers_percentage = this.formulaService.calculateBakersPercentage(
          this.formula.units * this.formula.unit_weight,
          this.original_formula.ingredients
        );
      }
      let total_weight = Number(
        (this.formula.units * this.formula.unit_weight)
      );
    
      this.formulaService.calculateIngredientsWithFormula(
        this.formula.ingredients,
        bakers_percentage,
        Number(total_weight)
      );
    }
    if (this.ingredientsAreValid()) {
      return true
    } else {
      this.formulaService.deleteIngredientsWithFormula(this.formula, this.formula)
      return false
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

  adjustFormulaMixing(new_ingredients: IngredientPercentageModel[], deleted_ingredients: IngredientPercentageModel[]) {
    if (this.formula.mixing) {
      if (new_ingredients.length > 0) {
        new_ingredients.forEach(ingredient=>{
          this.formula.mixing[0].ingredients.push(ingredient)
        })
      }
      if (deleted_ingredients.length > 0) {
        deleted_ingredients.forEach(ingredient=>{
          this.formula.mixing.forEach((mix, mix_i) => {
            mix.ingredients.forEach((mix_ingredient, ingredient_i) => {
              if (mix_ingredient.ingredient.id == ingredient.ingredient.id) {
                this.formula.mixing[mix_i].ingredients.splice(
                  ingredient_i,
                  1
                );
                if (this.formula.mixing[mix_i].ingredients.length == 0) {
                  this.formula.mixing.splice(mix_i,1)
                }
              }
            })
          })
        })
      }
    }
  }
}

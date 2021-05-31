import { Component, OnInit } from "@angular/core";
import {
  ModalController,
  IonRouterOutlet,
  LoadingController,
  ToastController,
  ViewWillEnter,
} from "@ionic/angular";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { IngredientModel } from "../../../core/models/ingredient.model";
import { IngredientCRUDService } from "../../../core/services/firebase/ingredient.service";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { FormulaModel, IngredientPercentageModel } from "src/app/core/models/formula.model";
import { IngredientMixingModal } from "src/app/shared/modal/mixing/ingredient-mixing.modal";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { UserModel } from "src/app/core/models/user.model";
import { ReferenceModel } from "src/app/core/models/shared.model";
import { ReferencesModal } from "src/app/shared/modal/references/references.modal";
import { IngredientService } from "src/app/core/services/ingredient.service";
import { FormulaService } from "src/app/core/services/formula.service";
import { ProductionModel } from "src/app/core/models/production.model";
import { ProductionService } from "src/app/core/services/production.service";
import { CourseService } from "src/app/core/services/course.service";
import { CourseModel } from "src/app/core/models/course.model";
import { DECIMALS } from "src/app/config/formats";

@Component({
  selector: "app-ingredient-manage",
  templateUrl: "./ingredient-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/ingredient-manage.page.scss",
  ],
})
export class IngredientManagePage implements OnInit, ViewWillEnter {
  APP_URL = APP_URL;
  ICONS = ICONS;

  ingredient: IngredientModel = new IngredientModel();
  original_ingredient: IngredientModel = new IngredientModel();
  manageIngredientForm: FormGroup;
  update: boolean = false;
  current_user = new UserModel();

  type: string = "simple";

  currency = CURRENCY;

  constructor(
    private ingredientCRUDService: IngredientCRUDService,
    private userStorageService: UserStorageService,
    private courseService: CourseService,
    private productionService: ProductionService,
    private formulaService: FormulaService,
    private ingredientService: IngredientService,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.ingredient = new IngredientModel();
    this.update = false;
    this.type = "simple";
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      delete this.ingredient.formula;
      this.manageIngredientForm = new FormGroup({
        name: new FormControl("", Validators.required),
        hydration: new FormControl("", Validators.required),
        fat: new FormControl("", Validators.required),
        is_flour: new FormControl(false, Validators.required),
        cost: new FormControl(0, Validators.required),
      });
      this.ingredient.user = {
        owner: this.current_user.email,
        can_clone: false,
        public: false,
        reference: "",
        shared_users: [],
        shared_references: [],
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
    } else {
      this.update = true;
      this.ingredient = JSON.parse(JSON.stringify(state.ingredient));
      this.original_ingredient = JSON.parse(JSON.stringify(state.ingredient))
      if (this.ingredient.formula) {
        this.type = "compound";
      }
      this.ingredient.user = state.ingredient.user;
      this.manageIngredientForm = new FormGroup({
        name: new FormControl(state.ingredient.name, Validators.required),
        hydration: new FormControl(
          state.ingredient.hydration,
          Validators.required
        ),
        fat: new FormControl(
          state.ingredient.fat,
          Validators.required
        ),
        is_flour: new FormControl(
          state.ingredient.is_flour,
          Validators.required
        ),
        cost: new FormControl(state.ingredient.cost, Validators.required),
      });
      this.ingredient.references = []
      if (state.ingredient.references && state.ingredient.references.length > 0) {
        state.ingredient.references.forEach((reference) => {
          this.ingredient.references.push(JSON.parse(JSON.stringify(reference)));
        });
      }
    }
    this.current_user = await this.userStorageService.getUser();
  }

  ionViewWillEnter() {
    if (this.ingredient.id) {
      this.update = true;
    } else {
      this.update = false;
    }
  }

  async pickIngredient() {
    let ingredients;
    if (this.ingredient.formula.ingredients) {
      ingredients = JSON.parse(JSON.stringify(this.ingredient.formula.ingredients));
    } else {
      ingredients = this.ingredient.formula.ingredients;
    }
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
    if (data !== undefined) {
      if (this.ingredient.formula.ingredients == null) {
        this.ingredient.formula.ingredients = [];
      }
      let new_ingredients: IngredientPercentageModel[] = []
      let deleted_ingredients: IngredientPercentageModel[] = []
      let exists: boolean
      this.ingredient.formula.ingredients.forEach(prev_ingredient => {
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
        this.ingredient.formula.ingredients.forEach(prev_ingredient => {
          if (prev_ingredient.ingredient.id == new_ingredient.ingredient.id) {
            exists = true
          }
        })
        if (!exists) {
          new_ingredients.push(new_ingredient)
        }
      })
      this.adjustMixing(new_ingredients, deleted_ingredients)
      this.ingredient.formula.ingredients = data.ingredients;
    }
  }

  async mixIngredients() {
    let mixedIngredients = [
      {
        ingredients: [],
        description: "",
      },
    ];
    if (!this.ingredient.formula.mixing || !this.ingredient.formula.mixing[0]) {
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
        formula: false
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.ingredient.formula.mixing = data.mixing;
    }
  }

  deleteSelectedIngredient(ingredient: IngredientPercentageModel) {
    this.ingredient.formula.ingredients.splice(
      this.ingredient.formula.ingredients.indexOf(ingredient),
      1
    );
    this.adjustMixing([], [ingredient])
  }

  canSend() {
    return (
      (!this.manageIngredientForm.valid && this.type == "simple") ||
      (this.ingredient.formula &&
        !(
          this.manageIngredientForm.value.name &&
          this.ingredient.formula.proportion_factor.factor &&
          this.ingredient.formula.ingredients &&
          this.ingredient.formula.ingredients.length>0 &&
          this.ingredientsAreValid()
        ))
    );
  }

  formatSuggestedValues(type: string, value: number) {
    let sugg_value: number = Number(this.formatNumberService.formatStringToDecimals(value.toString()));
    if (type == "min") {
      this.ingredient.formula.suggested_values.min = Number(
        this.formatNumberService.formatNonZeroPositiveNumber(sugg_value)
      );
    } else {
      this.ingredient.formula.suggested_values.max = Number(
        this.formatNumberService.formatNonZeroPositiveNumber(sugg_value)
      );
    }
  }

  async addReferences() {
    let references: Array<ReferenceModel>;
    if (this.ingredient.references) {
      references = JSON.parse(JSON.stringify(this.ingredient.references))
    }
    const modal = await this.modalController.create({
      component: ReferencesModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        references: references
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.ingredient.references = data;
    }
  }

  async sendIngredient() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    this.ingredient.name = this.manageIngredientForm.value.name;
    if (this.ingredient.references) {
      this.ingredient.references = JSON.parse(JSON.stringify(this.ingredient.references))
    }

    if (!this.ingredient.formula) {
      this.ingredient.hydration = this.manageIngredientForm.value.hydration;
      this.ingredient.fat = this.manageIngredientForm.value.fat;
      this.ingredient.is_flour = this.manageIngredientForm.value.is_flour;
      this.ingredient.cost = Number(this.manageIngredientForm.value.cost);
    } else {
      this.ingredient.hydration = Number(
        this.ingredientService.calculateHydration(
          this.ingredient.formula.ingredients
        )
      );
      this.ingredient.fat = Number(
        this.ingredientService.calculateFat(
          this.ingredient.formula.ingredients
        )
      );
      this.ingredient.is_flour = false;
      this.ingredient.cost = null;
      if (!this.ingredient.formula.compensation_percentage) {
        this.ingredient.formula.compensation_percentage = 0;
      }
      if (!this.ingredient.formula.mixing || !this.ingredient.formula.mixing[0]) {
        this.ingredient.formula.mixing = null
      }
    }

    if (!this.update) {
      this.ingredient.user = {
        owner: this.current_user.email,
        can_clone: this.ingredient.user.can_clone,
        public: this.ingredient.user.public,
        reference: "",
        shared_users: [],
        shared_references: [],
        creator: {
          name: this.current_user.name,
          email: this.current_user.email,
          date: new Date(),
        },
        modifiers: [],
      };
      this.ingredientCRUDService
        .create(this.ingredient)
        .then(() => {
          this.router.navigateByUrl(
            APP_URL.menu.name +
              "/" +
              APP_URL.menu.routes.ingredient.main +
              "/" +
              APP_URL.menu.routes.ingredient.routes.details,
            {
              state: { ingredient: JSON.parse(JSON.stringify(this.ingredient)) },
              replaceUrl: true
            }
          );
        })
        .catch(() => {
          this.presentToast(false);
        })
        .finally(async () => {
          await loading.dismiss();
        });
    } else {
      this.ingredient.user.modifiers.push({
        name: this.current_user.name,
        email: this.current_user.email,
        date: new Date(),
      });
      this.ingredientCRUDService
        .update(this.ingredient, this.original_ingredient)
        .then(async () => {
          let updated_ingredients: IngredientModel[] = [this.ingredient];
          await this.ingredientService.updateIngredients(this.ingredient, updated_ingredients);
          let updated_formulas: FormulaModel[] = [];
          await this.formulaService.updateIngredients(updated_ingredients, updated_formulas);
          let updated_productions: ProductionModel[] = []
          await this.productionService.updateFormulas(updated_formulas, updated_productions);
          if (this.current_user.instructor) {
            let updated_courses: CourseModel[] = []
            await this.courseService.updateAll(updated_courses, updated_ingredients, updated_formulas, updated_productions);
          }
          this.router.navigateByUrl(
            APP_URL.menu.name +
              "/" +
              APP_URL.menu.routes.ingredient.main +
              "/" +
              APP_URL.menu.routes.ingredient.routes.details,
            {
              state: { ingredient: JSON.parse(JSON.stringify(this.ingredient)) },
              replaceUrl: true
            }
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

  formatNumberPercentage(value: string, type: "fat" | "hydration") {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.0");
      this.manageIngredientForm.get("fat").patchValue("0.0");
    } else {
      let percentage: number = Number(this.formatNumberService.formatStringToDecimals(value));
      if (type == "hydration") {
        this.manageIngredientForm
        .get("hydration")
        .patchValue(this.formatNumberService.formatNumberPercentage(percentage));
      } else {
        this.manageIngredientForm
        .get("fat")
        .patchValue(this.formatNumberService.formatNumberPercentage(percentage));
      }
    }
  }

  formatCost(value: string) {
    let number = 0;
    if (value) {
      value = value.replace(/[^0-9.,]/, '');
      value = value.replace(/[,]/, '.');
      var parts = value.split(".");
      if (parts[1] !== undefined)
        value = parts.slice(0, -1).join('') + "." + parts.slice(-1);
      number = Number(value)
      if (isNaN(number)) {
        this.manageIngredientForm
          .get("cost")
          .patchValue(0);
      } else {
        this.manageIngredientForm
          .get("cost")
          .patchValue(number);
      }
    }
  }

  formatPercentage() {
    if (this.ingredient.formula) {
      let percentage: number = Number(this.formatNumberService.formatStringToDecimals(this.ingredient.formula.compensation_percentage.toString()));
      this.ingredient.formula.compensation_percentage = Number(
        this.formatNumberService.formatNumberPercentage(percentage)
      );
    }
  }

  formatDecimals(item: IngredientPercentageModel) {
    let percentage: number = 0;
    if (item.percentage) {
      percentage = Number(this.formatNumberService.formatStringToDecimals(item.percentage.toString(), DECIMALS.formula_percentage));
    }
    item.percentage = Number(
      this.formatNumberService.formatNumberFixedDecimals(percentage, DECIMALS.formula_percentage)
    );
  }

  changeFlourIngredient() {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.0");
      this.manageIngredientForm.get("fat").patchValue("0.0");
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

  adjustMixing(new_ingredients: IngredientPercentageModel[], deleted_ingredients: IngredientPercentageModel[]) {
    if (this.ingredient.formula.mixing && this.ingredient.formula.mixing[0]) {
      if (new_ingredients.length > 0) {
        new_ingredients.forEach(ingredient=>{
          this.ingredient.formula.mixing[0].ingredients.push(ingredient)
        })
      }
      if (deleted_ingredients.length > 0) {
        deleted_ingredients.forEach(ingredient=>{
          this.ingredient.formula.mixing.forEach((mix, mix_i) => {
            mix.ingredients.forEach((mix_ingredient, ingredient_i) => {
              if (mix_ingredient.ingredient.id == ingredient.ingredient.id) {
                this.ingredient.formula.mixing[mix_i].ingredients.splice(
                  ingredient_i,
                  1
                );
                if (this.ingredient.formula.mixing[mix_i].ingredients.length == 0) {
                  this.ingredient.formula.mixing.splice(mix_i,1)
                }
              }
            })
          })
        })
      }
    }
  }
}

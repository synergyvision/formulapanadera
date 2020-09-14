import { Component, OnInit, NgZone } from "@angular/core";
import {
  AlertController,
  ModalController,
  IonRouterOutlet,
} from "@ionic/angular";
import { Validators, FormGroup, FormControl } from "@angular/forms";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { IngredientService } from "../../../core/services/ingredient.service";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { IngredientPickerModal } from "src/app/shared/modal/ingredient/ingredient-picker.modal";
import { IngredientPercentageModel } from "src/app/core/models/formula.model";
import { IngredientMixingModal } from "src/app/shared/modal/mixing/ingredient-mixing.modal";
import { FormulaService } from "src/app/core/services/formula.service";

@Component({
  selector: "app-ingredient-manage",
  templateUrl: "./ingredient-manage.page.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/ingredient-manage.page.scss",
  ],
})
export class IngredientManagePage implements OnInit {
  ingredient: IngredientModel = new IngredientModel();
  manageIngredientForm: FormGroup;
  update: boolean = false;
  type: string = "simple";

  currency = environment.currency;

  constructor(
    private ingredientService: IngredientService,
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    public modalController: ModalController,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      this.ingredient.formula = null;
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
    }
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
          this.ingredient.formula.proportion_factor &&
          this.ingredient.formula.ingredients &&
          this.ingredientsAreValid() &&
          this.ingredient.formula.mixing
        ))
    );
  }

  sendIngredient() {
    this.ingredient.name = this.manageIngredientForm.value.name;
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
    if (!this.update) {
      this.ingredient.can_be_deleted = true;
      this.ingredientService.createIngredient(this.ingredient).then(() => {
        this.router.navigateByUrl("menu/ingredient");
      });
    } else {
      this.ingredientService.updateIngredient(this.ingredient).then(() => {
        this.router.navigateByUrl("menu/ingredient");
      });
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
          handler: () => {
            this.ingredientService
              .deleteIngredient(this.ingredient.id)
              .then(() => {
                this.ngZone
                  .run(() => this.router.navigate(["menu/ingredient"]))
                  .then();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  formatNumberDecimals(value: number) {
    this.manageIngredientForm
      .get("cost")
      .patchValue(this.formatNumberService.formatNumberDecimals(value));
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

  changeType(ev: any) {
    this.type = ev.detail.value;
    if (this.type == "compound") {
      this.ingredient.formula = {
        ingredients: [],
        mixing: [],
        compensation_percentage: null,
        proportion_factor: null,
      };
      this.ingredient.formula.proportion_factor = "dough";
    } else {
      this.ingredient.formula = null;
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
}

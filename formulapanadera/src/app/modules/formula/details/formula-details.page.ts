import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ActionSheetController,
  AlertController,
  ToastController,
  ViewWillEnter,
} from "@ionic/angular";
import {
  FormulaModel,
  StepDetailsModel,
  IngredientPercentageModel,
} from "src/app/core/models/formula.model";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { environment } from "src/environments/environment";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { AuthService } from "src/app/core/services/auth.service";

@Component({
  selector: "app-formula-details",
  templateUrl: "formula-details.page.html",
  styleUrls: [
    "./styles/formula-details.page.scss",
    "./../../../shared/styles/note.alert.scss",
    "./../../../shared/styles/confirm.alert.scss",
  ],
})
export class FormulaDetailsPage implements OnInit, OnDestroy {
  formula: FormulaModel = new FormulaModel();
  formulaUnit = "%";
  temperatureUnit = "C";
  units: number;

  bakers_percentage: string;
  total_weight: string;
  hydration: string;
  unitary_cost: string;
  total_cost: string;

  currency: string = environment.currency;

  ingredients: Array<IngredientPercentageModel>;
  steps: Array<StepDetailsModel>;

  showIngredients: boolean;
  showMixing: boolean;
  showSteps: boolean;

  state;

  constructor(
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private authService: AuthService,
    private formatNumberService: FormatNumberService,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router
  ) {
    this.showIngredients = true;
    this.showMixing = true;
    this.showSteps = true;
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    if (this.state === undefined) {
      this.router.navigateByUrl("menu/formula");
    } else {
      this.formula = this.state.formula;
      this.units = this.formula.units;
      this.ingredients = JSON.parse(JSON.stringify(this.formula.ingredients));
      this.steps = JSON.parse(JSON.stringify(this.formula.steps));
    }
  }

  ngOnDestroy() {
    this.units = this.formula.units;
    this.calculateFormula();
  }

  calculateFormula() {
    this.ingredients = JSON.parse(JSON.stringify(this.formula.ingredients));
    this.bakers_percentage = this.formulaService.calculateBakersPercentage(
      this.units * this.formula.unit_weight,
      this.ingredients
    );

    this.total_weight = (this.units * this.formula.unit_weight).toFixed(1);
    this.hydration = this.formulaService.calculateHydration(this.ingredients);
    this.total_cost = this.formulaService.calculateTotalCost(
      this.ingredients,
      Number(this.bakers_percentage)
    );
    this.unitary_cost = (Number(this.total_cost) / this.units).toFixed(2);

    this.calculateIngredientsWithFormula();
  }

  //Change
  changeTemperature(event: any) {
    this.temperatureUnit = event.detail.value;
    if (this.temperatureUnit == "F") {
      this.steps.forEach((step) => {
        if (step.temperature !== null) {
          step.temperature.min = Number(
            this.formatNumberService.fromCelsiusToFahrenheit(
              step.temperature.min
            )
          );
          if (step.temperature.max !== -1) {
            step.temperature.max = Number(
              this.formatNumberService.fromCelsiusToFahrenheit(
                step.temperature.max
              )
            );
          }
        }
      });
    } else {
      this.steps = JSON.parse(JSON.stringify(this.formula.steps));
    }
  }

  changeUnits(event: any) {
    if (event.detail.value > 0) {
      this.calculateFormula();
    }
  }

  //Options

  async presentOptions() {
    if (!this.formula.shared) {
      const actionSheet = await this.actionSheetController.create({
        cssClass: "formula-options",
        buttons: [
          {
            text: this.languageService.getTerm("action.update"),
            icon: "create-outline",
            cssClass: "action-icon",
            handler: () => {
              this.updateFormula();
            },
          },
          {
            text: this.languageService.getTerm("action.share"),
            icon: "share-outline",
            cssClass: "action-icon",
            handler: () => {
              this.shareFormula();
            },
          },
          {
            text: this.languageService.getTerm("action.cancel"),
            icon: "close",
            role: "cancel",
            cssClass: "cancel-icon",
            handler: () => {},
          },
        ],
      });
      await actionSheet.present();
    } else {
      const actionSheet = await this.actionSheetController.create({
        cssClass: "formula-options",
        buttons: [
          {
            text: this.languageService.getTerm("action.clone"),
            icon: "add-circle-outline",
            cssClass: "action-icon",
            handler: () => {
              this.cloneFormula();
            },
          },
          {
            text: this.languageService.getTerm("action.delete"),
            icon: "trash-outline",
            cssClass: "delete-icon",
            handler: () => {
              this.deleteFormula();
            },
          },
          {
            text: this.languageService.getTerm("action.cancel"),
            icon: "close",
            role: "cancel",
            cssClass: "cancel-icon",
            handler: () => {},
          },
        ],
      });
      await actionSheet.present();
    }
  }

  updateFormula() {
    this.units = this.formula.units;
    this.calculateFormula();
    this.router.navigateByUrl("menu/formula/manage", {
      state: { formula: this.formula },
    });
  }

  async shareFormula() {
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
            let formula = JSON.parse(JSON.stringify(this.formula));
            formula.useremail = data.email;
            formula.shared = true;
            this.formulaService
              .createFormula(formula)
              .then(() => {
                this.presentToast(true);
              })
              .catch(() => {
                this.presentToast(false);
              });
          },
        },
      ],
    });
    await alert.present();
  }

  async cloneFormula() {
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
            let formula = JSON.parse(JSON.stringify(this.formula));
            formula.useremail = this.authService.getLoggedInUser().email;
            formula.shared = false;
            formula.name = `${
              this.formula.name
            } (${this.languageService.getTerm("action.copy")})`;
            this.formulaService.createFormula(formula).then(() => {
              this.router.navigateByUrl("menu/formula");
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async deleteFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.formula.name,
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
            this.formulaService.deleteFormula(this.formula.id).then(() => {
              this.router.navigateByUrl("menu/formula");
            });
          },
        },
      ],
    });
    await alert.present();
  }

  async presentToast(success: boolean) {
    const toast = await this.toastController.create({
      message: success
        ? this.languageService.getTerm("formulas.share.success")
        : this.languageService.getTerm("formulas.share.error"),
      color: "secondary",
      duration: 5000,
      buttons: [
        {
          icon: "close",
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    toast.present();
  }

  // Calculate ingredients with formula
  calculateIngredientsWithFormula() {
    //Identifies ingredients with formula
    let ingredients_formula = [];
    this.ingredients.forEach((item) => {
      if (item.ingredient.formula) {
        ingredients_formula.push(JSON.parse(JSON.stringify(item)));
      }
    });

    if (ingredients_formula.length > 0) {
      this.ingredients.forEach((item) => {
        if (!item.ingredient.formula) {
          item.percentage = item.percentage * Number(this.bakers_percentage);
        }
      });

      let bakers_percentage: string;
      let proportion_factor: number;
      ingredients_formula.forEach((item: IngredientPercentageModel) => {
        // Get bakers percentage from certain factor
        if (item.ingredient.formula.proportion_factor == "dough") {
          proportion_factor =
            (item.percentage / 100) * Number(this.total_weight);
        } else {
          proportion_factor =
            (item.percentage / 100) * Number(this.bakers_percentage) * 100;
        }
        bakers_percentage = this.formulaService.calculateBakersPercentage(
          proportion_factor,
          item.ingredient.formula.ingredients
        );

        //Gets new values of ingredients

        this.ingredients.forEach((ingredient) => {
          if (!ingredient.ingredient.formula) {
            item.ingredient.formula.ingredients.forEach((ingredientFormula) => {
              if (ingredient.ingredient.id == ingredientFormula.ingredient.id) {
                ingredient.percentage =
                  ingredient.percentage -
                  ingredientFormula.percentage * Number(bakers_percentage);
              }
            });
          }
        });
      });

      //Gets new total flour of formula
      let total_flour = this.formulaService.totalFlour(this.ingredients);

      //Gets new percentage of ingredient with formula
      ingredients_formula.forEach((item) => {
        this.ingredients.forEach((ingredient) => {
          if (item.ingredient.id == ingredient.ingredient.id) {
            if (item.ingredient.formula.proportion_factor == "dough") {
              ingredient.percentage = Number(
                (
                  (ingredient.percentage / 100) *
                  Number(this.total_weight) *
                  (100 / total_flour)
                ).toFixed(2)
              );
            } else {
              ingredient.percentage = Number(
                (
                  ingredient.percentage *
                  Number(this.bakers_percentage) *
                  (100 / total_flour)
                ).toFixed(2)
              );
            }
          }
        });
      });

      //Gets new bakers percentage
      this.bakers_percentage = (
        this.formulaService.totalFlour(this.ingredients) / 100
      ).toFixed(2);

      //Sets ingredients
      this.ingredients = this.formulaService.fromRecipeToFormula(
        this.ingredients
      );
      this.ingredients.sort(
        (a: IngredientPercentageModel, b: IngredientPercentageModel) => {
          return b.percentage - a.percentage;
        }
      );
    }
  }
}

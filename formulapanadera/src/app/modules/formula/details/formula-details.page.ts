import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ActionSheetController,
  AlertController,
  ToastController,
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
import { UserModel } from "src/app/core/models/user.model";

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
  ingredients_formula: Array<any> = [];

  showIngredients: boolean;
  showSubIngredients: boolean;
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
    this.showSubIngredients = true;
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

    this.ingredients_formula = [];
    let bakers_percentage = this.formulaService.calculateIngredientsWithFormula(
      this.ingredients,
      this.ingredients_formula,
      this.bakers_percentage,
      Number(this.total_weight)
    );

    let ing_formula;
    this.steps.forEach((step) => {
      ing_formula = [];
      if (step.ingredients) {
        step.ingredients.forEach((ingredient) => {
          if (ingredient.ingredient.formula) {
            ing_formula.push(ingredient);
          }
        });
        this.formulaService.getIngredientsCalculatedPercentages(
          Number(this.total_weight),
          Number(this.bakers_percentage),
          step.ingredients,
          ing_formula,
          this.ingredients_formula
        );
      }
    });

    if (bakers_percentage) {
      this.bakers_percentage = bakers_percentage;
    }

    this.formulaService.sortIngredients(this.ingredients);
    this.ingredients_formula.forEach((item) => {
      this.formulaService.sortIngredients(item.ingredient.formula.ingredients);
    });
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
    let current_user = this.authService.getLoggedInUser().email;
    let is_modifier = false;
    this.formula.user.modifiers.forEach((modifier: UserModel) => {
      if (modifier.email == current_user) {
        is_modifier = true;
      }
    });
    let buttons = [];
    if (this.formula.user.cloned) {
      buttons.push({
        text: this.languageService.getTerm("action.update"),
        icon: "create-outline",
        cssClass: "action-icon",
        handler: () => {
          this.updateFormula();
        },
      });
    }
    if (
      this.formula.user.owner &&
      ((this.formula.user.cloned && is_modifier) ||
        this.formula.user.creator.email == current_user)
    ) {
      // If not public but is cloned and was modified or user is creator
      buttons.push({
        text: this.languageService.getTerm("action.share"),
        icon: "share-outline",
        cssClass: "action-icon",
        handler: () => {
          this.shareFormula();
        },
      });
    }
    if (!this.formula.user.cloned && this.formula.user.can_clone) {
      // If not cloned but can clone
      buttons.push({
        text: this.languageService.getTerm("action.clone"),
        icon: "add-circle-outline",
        cssClass: "action-icon",
        handler: () => {
          this.cloneFormula();
        },
      });
    }
    if (!this.formula.user.cloned && this.formula.user.owner) {
      // If not public or cloned
      buttons.push({
        text: this.languageService.getTerm("action.delete"),
        icon: "trash-outline",
        cssClass: "delete-icon",
        handler: () => {
          this.deleteFormula();
        },
      });
    }
    buttons.push(
      {
        text: this.languageService.getTerm("credits.name"),
        icon: "people-outline",
        cssClass: "action-icon",
        handler: () => {
          this.showCredits();
        },
      },
      {
        text: this.languageService.getTerm("action.cancel"),
        icon: "close",
        role: "cancel",
        cssClass: "cancel-icon",
        handler: () => {},
      }
    );

    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: buttons,
    });
    await actionSheet.present();
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
            formula.user.owner = data.email;
            formula.user.cloned = false;
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
            formula.user.owner = this.authService.getLoggedInUser().email;
            formula.user.cloned = true;
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

  async showCredits() {
    let creator_title = this.languageService.getTerm("credits.creator");
    let creator_name = `${this.formula.user.creator.name} (${this.formula.user.creator.email})`;
    let modifiers_title = this.languageService.getTerm("credits.modifiers");
    let modifiers = "";
    this.formula.user.modifiers.forEach((modifier) => {
      modifiers = modifiers + `${modifier.name} (${modifier.email})<br>`;
    });
    let text = `<strong>${creator_title}:</strong><br/> ${creator_name} <br/><br/>
                <strong>${modifiers_title}:</strong><br/> ${modifiers}`;
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("credits.name"),
      message: text,
      cssClass: "alert clone-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {},
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
}

import { Component, OnInit } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import { ActionSheetController } from "@ionic/angular";
import {
  FormulaModel,
  StepDetailsModel,
} from "src/app/core/models/formula.model";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { environment } from "src/environments/environment";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-deatils",
  templateUrl: "formula-details.page.html",
  styleUrls: ["./styles/formula-details.page.scss"],
})
export class FormulaDetailsPage implements OnInit {
  formula: FormulaModel = new FormulaModel();
  formulaUnit = "%";
  temperatureUnit = "C";

  bakers_percentage: string;
  total_weight: string;
  hydration: string;
  unitary_cost: string;
  total_cost: string;

  cost_unit: string = environment.ingredient_cost_unit;

  steps: Array<StepDetailsModel>;

  showIngredients: boolean;
  showMixing: boolean;
  showSteps: boolean;

  constructor(
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private actionSheetController: ActionSheetController,
    private router: Router
  ) {}

  ngOnInit() {
    this.showIngredients = true;
    this.showMixing = true;
    this.showSteps = true;
    let state = this.router.getCurrentNavigation().extras.state;
    if (state === undefined) {
      this.router.navigateByUrl("menu/formula");
    } else {
      this.formula = state.formula;
      this.bakers_percentage = this.formulaService.calculateBakersPercentage(
        this.formula
      );
      this.total_weight = (
        this.formula.units * this.formula.unit_weight
      ).toFixed(1);
      this.hydration = this.formulaService.calculateHydration(this.formula);
      this.total_cost = this.formulaService.calculateTotalCost(
        this.formula,
        Number(this.bakers_percentage)
      );
      this.unitary_cost = (
        Number(this.total_cost) / this.formula.units
      ).toFixed(2);

      this.steps = JSON.parse(JSON.stringify(this.formula.steps));
    }
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

  //Options

  async presentOptions() {
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
          handler: () => {},
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

  updateFormula() {
    this.router.navigateByUrl("menu/formula/manage", {
      state: { formula: this.formula },
    });
  }
}

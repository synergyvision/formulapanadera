import { Component, OnInit, OnDestroy } from "@angular/core";
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
      this.units = this.formula.units;
      this.calculateFormula();

      this.steps = JSON.parse(JSON.stringify(this.formula.steps));
    }
  }

  ngOnDestroy() {
    this.units = this.formula.units;
    this.calculateFormula();
  }

  calculateFormula() {
    this.bakers_percentage = this.formulaService.calculateBakersPercentage(
      this.units,
      this.formula
    );
    this.total_weight = (this.units * this.formula.unit_weight).toFixed(1);
    this.hydration = this.formulaService.calculateHydration(this.formula);
    this.total_cost = this.formulaService.calculateTotalCost(
      this.formula,
      Number(this.bakers_percentage)
    );
    this.unitary_cost = (Number(this.total_cost) / this.units).toFixed(2);
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
    this.units = this.formula.units;
    this.calculateFormula();
    this.router.navigateByUrl("menu/formula/manage", {
      state: { formula: this.formula },
    });
  }
}

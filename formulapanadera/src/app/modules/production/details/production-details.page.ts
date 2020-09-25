import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { DECIMALS } from "src/app/config/formats";
import { ICONS } from "src/app/config/icons";
import {
  FormulaNumberModel,
  FormulaPresentModel,
  ProductionModel,
} from "src/app/core/models/production.model";
import { FormulaService } from "src/app/core/services/formula.service";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-production-details",
  templateUrl: "production-details.page.html",
  styleUrls: ["./styles/production-details.page.scss"],
})
export class ProductionDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  showIngredients: boolean;
  showDetails: boolean;
  showTimes: boolean;

  production: ProductionModel = new ProductionModel();
  original_production: ProductionModel = new ProductionModel();
  formulas: Array<FormulaPresentModel & { show: boolean }>;

  state;

  constructor(
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private router: Router,
    private actionSheetController: ActionSheetController
  ) {
    this.showIngredients = true;
    this.showDetails = true;
    this.showTimes = true;

    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    if (this.state === undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
      );
    } else {
      this.production = JSON.parse(JSON.stringify(this.state.production));
      this.original_production = JSON.parse(
        JSON.stringify(this.state.production)
      );
      this.calculateFormulas();
    }
  }

  calculateFormulas() {
    this.formulas = [];
    this.production = JSON.parse(JSON.stringify(this.original_production));
    let presentFormula: FormulaPresentModel;
    this.production.formulas.forEach((formula) => {
      presentFormula = this.calculateFormula(formula);
      this.formulas.push({ ...presentFormula, show: false });
    });
  }

  calculateFormula(initial_formula: FormulaNumberModel): FormulaPresentModel {
    let transformed_formula: FormulaPresentModel;
    transformed_formula = {
      ...initial_formula,
      bakers_percentage: null,
      total_cost: null,
      unitary_cost: null,
      ingredients_formula: [],
    };
    transformed_formula.bakers_percentage = this.formulaService.calculateBakersPercentage(
      initial_formula.number * initial_formula.formula.unit_weight,
      transformed_formula.formula.ingredients
    );

    let total_weight = Number(
      (initial_formula.number * initial_formula.formula.unit_weight).toFixed(
        DECIMALS.weight
      )
    );

    transformed_formula.total_cost = this.formulaService.calculateTotalCost(
      transformed_formula.formula.ingredients,
      Number(transformed_formula.bakers_percentage)
    );
    transformed_formula.unitary_cost = (
      Number(transformed_formula.total_cost) / initial_formula.number
    ).toFixed(DECIMALS.cost);

    let bakers_percentage = this.formulaService.calculateIngredientsWithFormula(
      transformed_formula.formula.ingredients,
      transformed_formula.ingredients_formula,
      transformed_formula.bakers_percentage,
      Number(total_weight)
    );

    let ing_formula;
    initial_formula.formula.steps.forEach((step) => {
      ing_formula = [];
      if (step.ingredients) {
        step.ingredients.forEach((ingredient) => {
          if (ingredient.ingredient.formula) {
            ing_formula.push(ingredient);
          }
        });
        this.formulaService.getIngredientsCalculatedPercentages(
          Number(total_weight),
          Number(transformed_formula.bakers_percentage),
          step.ingredients,
          ing_formula,
          transformed_formula.ingredients_formula
        );
      }
    });

    if (bakers_percentage) {
      transformed_formula.bakers_percentage = bakers_percentage;
    }

    initial_formula.formula.steps.forEach((item) => {
      if (item.ingredients) {
        item.ingredients = this.formulaService.sortIngredients(
          item.ingredients
        );
      }
    });
    transformed_formula.ingredients_formula.forEach((item) => {
      item.ingredient.formula.ingredients = this.formulaService.sortIngredients(
        item.ingredient.formula.ingredients
      );
    });
    transformed_formula.formula.ingredients = this.formulaService.sortIngredients(
      transformed_formula.formula.ingredients
    );

    return transformed_formula;
  }

  async presentOptions() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: [
        {
          text: this.languageService.getTerm("action.update"),
          icon: ICONS.create,
          cssClass: "action-icon",
          handler: () => {
            this.updateProduction();
          },
        },
        {
          text: this.languageService.getTerm("action.cancel"),
          icon: ICONS.close,
          role: "cancel",
          cssClass: "cancel-icon",
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  updateProduction() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.management,
      {
        state: { production: this.production },
      }
    );
  }
}

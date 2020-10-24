import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActionSheetController, AlertController, LoadingController, ToastController } from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { DECIMALS } from "src/app/config/formats";
import { ICONS } from "src/app/config/icons";
import { FormulaModel } from 'src/app/core/models/formula.model';
import {
  FormulaNumberModel,
  FormulaPresentModel,
  ProductionModel,
} from "src/app/core/models/production.model";
import { ProductionCRUDService } from 'src/app/core/services/firebase/production.service';
import { FormulaService } from "src/app/core/services/formula.service";
import { LanguageService } from "src/app/core/services/language.service";
import { ProductionInProcessStorageService } from "src/app/core/services/storage/production-in-process.service";
import { ProductionStorageService } from 'src/app/core/services/storage/production.service';

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

  production_in_process: boolean = false;

  state;

  constructor(
    private formulaService: FormulaService,
    private languageService: LanguageService,
    private router: Router,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private productionCRUDService: ProductionCRUDService,
    private productionStorageService: ProductionStorageService,
    private productionInProcessStorageService: ProductionInProcessStorageService,
  ) {
    this.showIngredients = false;
    this.showDetails = false;
    this.showTimes = false;

    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    this.production = JSON.parse(JSON.stringify(this.state.production));
    this.production = JSON.parse(JSON.stringify(this.state.production));
    this.original_production = JSON.parse(
      JSON.stringify(this.state.production)
    );
    this.calculateFormulas();

    let existing_production = await this.productionInProcessStorageService.getProduction();
    if (
      existing_production &&
      this.production.id !== existing_production.production.id
    ) {
      this.production_in_process = true;
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
    let formula: FormulaModel = JSON.parse(JSON.stringify(transformed_formula.formula))
    let formula_without_compound: FormulaModel = JSON.parse(JSON.stringify(formula))
    formula_without_compound.ingredients.forEach((ingredient, index) => {
      if (ingredient.ingredient.formula) {
        formula_without_compound.ingredients.splice(
          index,
          1
        );
      }
    })
    let bakers_p = this.formulaService.deleteIngredientsWithFormula(formula, formula_without_compound)
    transformed_formula.total_cost = this.formulaService.calculateTotalCost(
      formula_without_compound.ingredients,
      Number(bakers_p)
    );
    transformed_formula.unitary_cost = (
      Number(transformed_formula.total_cost) / initial_formula.number
    ).toString();

    transformed_formula.ingredients_formula = []
    let ing_formula = [];
    //Identifies ingredients with formula
    this.formulaService.getIngredientsWithFormula(
      transformed_formula.formula.ingredients,
      ing_formula
    );
    this.formulaService.getAllIngredientsWithFormula(
      Number(transformed_formula.bakers_percentage),
      transformed_formula.formula.ingredients,
      ing_formula,
      transformed_formula.ingredients_formula
    )

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
          "ADD",
          transformed_formula.ingredients_formula
        );
      }
    });

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
          text: this.languageService.getTerm("action.delete"),
          icon: ICONS.trash,
          cssClass: "delete-icon",
          handler: () => {
            this.deleteProduction();
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
        state: { production: this.original_production },
      }
    );
  }

  startProduction() {
    if (!this.production_in_process) {
      this.router.navigateByUrl(
        APP_URL.menu.name +
          "/" +
          APP_URL.menu.routes.production.main +
          "/" +
          APP_URL.menu.routes.production.routes.start,
        {
          state: { production: this.production, formulas: this.formulas },
        }
      );
    }
  }

  async deleteProduction() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.production.name,
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

            this.productionCRUDService
              .deleteProduction(this.production.id)
              .then(async () => {
                await this.productionStorageService
                  .deleteProduction(this.production.id)
                  .then(() => {
                    this.router.navigateByUrl(
                      APP_URL.menu.name +
                        "/" +
                        APP_URL.menu.routes.production.main
                    );
                  });
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

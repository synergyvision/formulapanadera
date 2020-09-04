import { Component } from "@angular/core";
import { FormulaService } from "src/app/core/services/formula.service";
import {
  ModalController,
  IonRouterOutlet,
  AlertController,
} from "@ionic/angular";
import { IngredientPickerModal } from "../modal/ingredient/ingredient-picker.modal";
import {
  IngredientPercentageModel,
  FormulaModel,
} from "src/app/core/models/formula.model";
import { AuthService } from "src/app/core/services/auth.service";
import { IngredientMixingModal } from "../modal/mixing/ingredient-mixing.modal";
import { FormulaStepsModal } from "../modal/steps/formula-steps.modal";
import { environment } from "src/environments/environment";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { LanguageService } from "src/app/core/services/language.service";
import { Router } from "@angular/router";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-formula-manage",
  templateUrl: "formula-manage.page.html",
  styleUrls: [
    "./styles/formula-manage.page.scss",
    "./../../../../shared/styles/confirm.alert.scss",
  ],
})
export class FormulaManagePage {
  formula: FormulaModel = new FormulaModel();
  manageFormulaForm: FormGroup;
  formulaUnit = "%";
  temperatureUnit = "C";
  update: boolean = false;

  constructor(
    private formulaService: FormulaService,
    private authService: AuthService,
    public modalController: ModalController,
    private alertController: AlertController,
    private routerOutlet: IonRouterOutlet,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private router: Router
  ) {}

  ngOnInit() {
    let state = this.router.getCurrentNavigation().extras.state;
    if (state == undefined) {
      this.manageFormulaForm = new FormGroup({
        name: new FormControl(null, Validators.required),
        units: new FormControl(null, Validators.required),
        unit_weight: new FormControl(null, Validators.required),
      });
    } else {
      this.update = true;
      this.manageFormulaForm = new FormGroup({
        name: new FormControl(state.formula.name, Validators.required),
        units: new FormControl(state.formula.units, Validators.required),
        unit_weight: new FormControl(
          state.formula.unit_weight,
          Validators.required
        ),
      });
      this.formula = state.formula;
    }
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

  async pickIngredient() {
    const modal = await this.modalController.create({
      component: IngredientPickerModal,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        selectedIngredients: this.formula.ingredients,
        formulaUnit: this.formulaUnit,
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      if (this.formula.ingredients == null) {
        this.formula.ingredients = [];
      }
      this.formula.ingredients.push(data);
      this.formula.mixing = undefined;
    }
  }

  async mixIngredients() {
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
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data !== undefined) {
      this.formula.mixing = data;
    }
  }

  async describeSteps() {
    let steps = [];
    if (!this.formula.steps) {
      for (let i = 0; i < environment.bakery_steps; i++) {
        steps.push({
          number: i,
          name: this.languageService.getTerm("steps." + (i + 1)),
          time: 1,
          temperature: null,
          description: "",
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

  sendFormula() {
    this.formula.name = this.manageFormulaForm.value.name;
    this.formula.shared = false;
    this.formula.units = this.manageFormulaForm.value.units;
    this.formula.unit_weight = this.manageFormulaForm.value.unit_weight;
    this.formula.useremail = this.authService.getLoggedInUser().email;
    if (this.update) {
      this.formulaService.updateFormula(this.formula);
    } else {
      this.formulaService.createFormula(this.formula);
    }
  }

  async deleteFormula() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.manageFormulaForm.value.name,
      }),
      cssClass: "alert confirm-alert",
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
}

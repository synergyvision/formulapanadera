import { Component, OnInit } from "@angular/core";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-ingredient-details",
  templateUrl: "./ingredient-details.page.html",
  styleUrls: ["./styles/ingredient-details.page.scss"],
})
export class IngredientDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  ingredient: IngredientModel = new IngredientModel();
  type: string = "simple";

  currency = CURRENCY;

  showIngredients: boolean;
  showMixing: boolean;

  state;

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private languageService: LanguageService
  ) {
    this.showIngredients = false;
    this.showMixing = false;
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    this.ingredient = this.state.ingredient;
    if (this.ingredient.formula) {
      this.type = "compound";
    }
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
            this.updateIngredient();
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

  updateIngredient() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.ingredient.main +
        "/" +
        APP_URL.menu.routes.ingredient.routes.management,
      {
        state: { ingredient: this.ingredient },
      }
    );
  }

  getProportionFactor(): string {
    if (this.ingredient.formula.proportion_factor.factor == "dough") {
      return this.languageService.getTerm(
        "ingredients.proportion_factor.dough"
      );
    } else if (this.ingredient.formula.proportion_factor.factor == "flour") {
      return this.languageService.getTerm(
        "ingredients.proportion_factor.flour"
      );
    } else if (
      this.ingredient.formula.proportion_factor.factor == "ingredient"
    ) {
      return this.ingredient.formula.proportion_factor.ingredient.name;
    } else {
      return "";
    }
  }
}

import { Component, OnInit } from "@angular/core";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-ingredient-details",
  templateUrl: "./ingredient-details.page.html",
  styleUrls: ["./styles/ingredient-details.page.scss"],
})
export class IngredientDetailsPage implements OnInit {
  ingredient: IngredientModel = new IngredientModel();
  type: string = "simple";

  currency = environment.currency;

  showIngredients: boolean;
  showMixing: boolean;

  state;

  constructor(
    private router: Router,
    private actionSheetController: ActionSheetController,
    private languageService: LanguageService
  ) {
    this.showIngredients = true;
    this.showMixing = true;
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  ngOnInit() {
    if (this.state === undefined) {
      this.router.navigateByUrl("menu/ingredient");
    } else {
      this.ingredient = this.state.ingredient;
      if (this.ingredient.formula) {
        this.type = "compound";
      }
    }
  }

  async presentOptions() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: [
        {
          text: this.languageService.getTerm("action.update"),
          icon: "create-outline",
          cssClass: "action-icon",
          handler: () => {
            this.updateIngredient();
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

  updateIngredient() {
    this.router.navigateByUrl("menu/ingredient/manage", {
      state: { ingredient: this.ingredient },
    });
  }
}

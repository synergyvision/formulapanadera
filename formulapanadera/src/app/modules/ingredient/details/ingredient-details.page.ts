import { Component, NgZone, OnInit } from "@angular/core";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController, AlertController, LoadingController, ToastController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { APP_URL, CURRENCY } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserResumeModel } from "src/app/core/models/user.model";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { DECIMAL_COST_FORMAT } from "src/app/config/formats";
import { IngredientCRUDService } from 'src/app/core/services/firebase/ingredient.service';
import { IngredientPercentageModel } from "src/app/core/models/formula.model";

@Component({
  selector: "app-ingredient-details",
  templateUrl: "./ingredient-details.page.html",
  styleUrls: [
    "./styles/ingredient-details.page.scss",
    "./../../../shared/styles/confirm.alert.scss"
  ],
})
export class IngredientDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  ingredient: IngredientModel = new IngredientModel();
  ingredients_formula: IngredientPercentageModel[] = [];
  type: string = "simple";

  currency = CURRENCY;
  INGREDIENT_COST_FORMAT = DECIMAL_COST_FORMAT.ingredient;

  showIngredients: boolean;
  showMixing: boolean;

  user: UserResumeModel = new UserResumeModel();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private ngZone: NgZone,
    private languageService: LanguageService,
    private userStorageService: UserStorageService,
    private ingredientCRUDService: IngredientCRUDService
  ) {
    this.showIngredients = true;
    this.showMixing = false;
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(async () => {
      this.ingredients_formula = []
      let navParams = this.router.getCurrentNavigation().extras.state;
      if (navParams) {
        this.ingredient = navParams.ingredient;
      }

      if (this.ingredient.formula) {
        this.type = "compound";
        this.ingredient.formula.ingredients.forEach(ingredient => {
          if (ingredient.ingredient.formula) {
            this.ingredients_formula.push(ingredient)
          }
        })
      }
      let user = await this.userStorageService.getUser();
      this.user = {name: user.name, email: user.email}
    });
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
        text: this.languageService.getTerm("action.delete"),
        icon: ICONS.trash,
        cssClass: "delete-icon",
          handler: () => {
            this.deleteIngredient();
          }
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

  async deleteIngredient() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.ingredient.name,
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

            this.ingredientCRUDService
              .deleteIngredient(this.ingredient.id)
              .then(() => {
                this.ngZone.run(() =>
                  this.router.navigate([
                    APP_URL.menu.name +
                      "/" +
                      APP_URL.menu.routes.ingredient.main,
                  ])
                );
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

  async presentToast(success: boolean, exists: boolean = false) {
    const toast = await this.toastController.create({
      message: exists
        ? this.languageService.getTerm("send.exists")
        : success
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

  returnToList() {
    this.router.navigateByUrl(
      APP_URL.menu.name + "/" + APP_URL.menu.routes.ingredient.main
    );
  }
}

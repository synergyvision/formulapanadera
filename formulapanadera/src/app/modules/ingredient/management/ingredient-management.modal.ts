import { Component, OnInit, Input, NgZone } from "@angular/core";
import { ModalController, AlertController } from "@ionic/angular";
import { Validators, FormGroup, FormControl } from "@angular/forms";

import { IngredientModel } from "../../../core/models/ingredient.model";
import { IngredientService } from "../../../core/services/ingredient.service";
import { environment } from "src/environments/environment";
import { Router } from "@angular/router";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";

@Component({
  selector: "app-ingredient-management",
  templateUrl: "./ingredient-management.modal.html",
  styleUrls: [
    "./../../../shared/styles/confirm.alert.scss",
    "./styles/ingredient-management.modal.scss",
  ],
})
export class IngredientManagementModal implements OnInit {
  @Input() ingredient: IngredientModel;
  @Input() type: string;

  manageIngredientForm: FormGroup;
  ingredientData: IngredientModel = new IngredientModel();

  ingredient_cost_unit = environment.ingredient_cost_unit;

  constructor(
    private modalController: ModalController,
    private ingredientService: IngredientService,
    private languageService: LanguageService,
    private formatNumberService: FormatNumberService,
    private alertController: AlertController,
    private router: Router,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    if (!this.ingredient) {
      this.manageIngredientForm = new FormGroup({
        name: new FormControl("", Validators.required),
        hydration: new FormControl("", Validators.required),
        is_flour: new FormControl(false, Validators.required),
        cost: new FormControl("", Validators.required),
      });
    } else {
      this.manageIngredientForm = new FormGroup({
        name: new FormControl(this.ingredient.name, Validators.required),
        hydration: new FormControl(
          this.ingredient.hydration,
          Validators.required
        ),
        is_flour: new FormControl(
          this.ingredient.is_flour,
          Validators.required
        ),
        cost: new FormControl(this.ingredient.cost, Validators.required),
      });
    }
  }

  dismissModal() {
    this.modalController.dismiss();
  }

  sendIngredient() {
    this.ingredientData.name = this.manageIngredientForm.value.name;
    this.ingredientData.hydration = this.manageIngredientForm.value.hydration;
    this.ingredientData.is_flour = this.manageIngredientForm.value.is_flour;
    this.ingredientData.cost = this.manageIngredientForm.value.cost;
    if (this.type == "create") {
      this.ingredientData.can_be_deleted = true;
      this.ingredientService.createIngredient(this.ingredientData).then(() => {
        this.dismissModal();
      });
    } else {
      this.ingredientData.id = this.ingredient.id;
      this.ingredientService
        .updateIngredient(this.ingredientData)
        .then(() => this.modalController.dismiss());
    }
  }

  async deleteIngredient() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.delete_question", {
        item: this.manageIngredientForm.value.name,
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
            this.ingredientService
              .deleteIngredient(this.ingredient.id)
              .then(() => {
                this.dismissModal();
                this.ngZone
                  .run(() => this.router.navigate(["menu/ingredient"]))
                  .then();
              });
          },
        },
      ],
    });
    await alert.present();
  }

  formatNumberDecimals(value: number) {
    this.manageIngredientForm
      .get("cost")
      .patchValue(this.formatNumberService.formatNumberDecimals(value));
  }

  formatNumberPercentage(value: number) {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.00");
    } else {
      this.manageIngredientForm
        .get("hydration")
        .patchValue(this.formatNumberService.formatNumberDecimals(value));
    }
  }

  changeFlourIngredient() {
    if (this.manageIngredientForm.value.is_flour) {
      this.manageIngredientForm.get("hydration").patchValue("0.00");
    }
  }
}

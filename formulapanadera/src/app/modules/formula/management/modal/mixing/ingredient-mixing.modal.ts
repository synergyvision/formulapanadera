import { Component, Input } from "@angular/core";
import { ModalController } from "@ionic/angular";
import {
  IngredientMixingModel,
  IngredientPercentageModel,
} from "src/app/core/models/formula.model";

@Component({
  selector: "app-ingredient-mixing",
  templateUrl: "ingredient-mixing.modal.html",
  styleUrls: ["./styles/ingredient-mixing.modal.scss"],
})
export class IngredientMixingModal {
  @Input() formulaMixing: Array<IngredientMixingModel>;

  constructor(public modalController: ModalController) {}

  dismissModal() {
    this.modalController.dismiss();
  }

  saveMixing() {
    this.modalController.dismiss(this.formulaMixing);
  }

  addStep() {
    this.formulaMixing.push({ ingredients: [], description: "" });
  }

  deleteStep(step: IngredientMixingModel) {
    let index = this.formulaMixing.indexOf(step);
    this.formulaMixing.splice(index, 1);
  }

  changeMixingOrder(
    event: any,
    previousIndex: number,
    ingredient: IngredientPercentageModel
  ) {
    let index = this.formulaMixing[previousIndex].ingredients.indexOf(
      ingredient
    );
    this.formulaMixing[previousIndex].ingredients.splice(index, 1)[0];
    this.formulaMixing[event.detail.value].ingredients.push(ingredient);
  }

  stepsEmpty() {
    let isEmpty = false;
    this.formulaMixing.forEach((mixStep) => {
      if (mixStep.ingredients.length == 0) {
        isEmpty = true;
      }
    });
    return isEmpty;
  }
}

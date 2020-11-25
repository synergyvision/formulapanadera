import { AfterViewInit, Component, Input, QueryList, ViewChildren } from "@angular/core";
import { IonTextarea, ModalController } from "@ionic/angular";
import { ICONS } from "src/app/config/icons";
import {
  IngredientMixingModel,
  IngredientPercentageModel,
} from "src/app/core/models/formula.model";

@Component({
  selector: "app-ingredient-mixing-modal",
  templateUrl: "ingredient-mixing.modal.html",
  styleUrls: ["./styles/ingredient-mixing.modal.scss"],
})
export class IngredientMixingModal implements AfterViewInit {
  ICONS = ICONS;

  @ViewChildren("stepdescription") private textAreas: QueryList<IonTextarea>
  @Input() formulaMixing: Array<IngredientMixingModel>;
  @Input() editable: boolean;

  constructor(public modalController: ModalController) { }
  
  ngAfterViewInit() {
    this.textAreas.toArray().forEach(textArea => {
      textArea.autoGrow = true;
      textArea.ionChange.subscribe(() => {
        textArea.autoGrow = true;
      })
    })
  }

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

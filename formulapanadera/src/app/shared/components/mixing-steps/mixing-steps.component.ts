import { Component, Input } from "@angular/core";
import { IngredientMixingModel } from "src/app/core/models/formula.model";
import { AlertController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-mixing-steps",
  templateUrl: "./mixing-steps.component.html",
  styleUrls: [
    "./styles/mixing-steps.component.scss",
    "../../styles/note.alert.scss",
  ],
})
export class MixingStepsComponent {
  @Input() steps: Array<IngredientMixingModel>;

  constructor(
    private alertController: AlertController,
    private languageService: LanguageService
  ) {}

  async showNote(stepNumber: number, step: IngredientMixingModel) {
    const alert = await this.alertController.create({
      cssClass: "formula-note-alert alert",
      header: `${this.languageService.getTerm("formulas.step")} ${
        stepNumber + 1
      }`,
      message: step.description,
      buttons: [this.languageService.getTerm("action.ok")],
    });

    await alert.present();
  }
}

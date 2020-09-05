import { Component, Input } from "@angular/core";
import { StepDetailsModel } from "src/app/core/models/formula.model";
import { AlertController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-formula-steps",
  templateUrl: "./formula-steps.component.html",
  styleUrls: [
    "./styles/formula-steps.component.scss",
    "../../styles/note.alert.scss",
  ],
})
export class FormulaStepsComponent {
  @Input() steps: Array<StepDetailsModel>;
  @Input() temperatureUnit: string;

  constructor(
    private alertController: AlertController,
    private languageService: LanguageService
  ) {}

  async showNote(stepTitle: string, step: StepDetailsModel) {
    const alert = await this.alertController.create({
      cssClass: "formula-note-alert alert",
      header: stepTitle,
      message: step.description,
      buttons: [this.languageService.getTerm("action.ok")],
    });

    await alert.present();
  }
}

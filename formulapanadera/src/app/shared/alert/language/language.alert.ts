import { Injectable, OnInit } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { LanguageModel } from "src/app/core/models/language.model";
import { LanguageService } from "src/app/core/services/language.service";

@Injectable()
export class LanguageAlert implements OnInit {
  languages: Array<LanguageModel> = new Array<LanguageModel>();
  available_languages = [];
  translations;

  constructor(
    private alertController: AlertController,
    private languageService: LanguageService
  ) {
    this.languages = this.languageService.getLanguages();
  }

  ngOnInit(): void {
    this.languageService.initLanguages();
  }

  async openLanguageChooser() {
    this.available_languages = this.languages.map((item) => ({
      name: item.name,
      type: "radio",
      label: item.name,
      value: item,
      checked: item.code === this.languageService.getCurrentLang(),
    }));

    const alert = await this.alertController.create({
      header: this.languageService.getTerm("settings.language.select"),
      inputs: this.available_languages,
      cssClass: "language-alert alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          cssClass: "secondary",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          handler: (data: LanguageModel) => {
            if (data) {
              this.languageService.useLang(data);
            }
          },
        },
      ],
    });
    await alert.present();
  }
}

import { Injectable } from "@angular/core";
import { LanguageModel } from "./language.model";
import { TranslateService } from "@ngx-translate/core";
import { AlertController } from "@ionic/angular";

import { environment } from "../../../environments/environment";

@Injectable()
export class LanguageService {
  languages: Array<LanguageModel> = new Array<LanguageModel>();
  available_languages = [];
  translations;

  constructor(
    private translateService: TranslateService,
    private alertController: AlertController
  ) {
    this.languages = environment.language.available;
  }

  getLanguages() {
    return this.languages;
  }

  public initLanguages() {
    this.getTranslations();

    this.translateService.onLangChange.subscribe(() => {
      this.getTranslations();
    });
  }

  public getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translateService
      .getTranslation(this.translateService.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
      });
  }

  async openLanguageChooser() {
    this.available_languages = this.languages.map((item) => ({
      name: item.name,
      type: "radio",
      label: item.name,
      value: item.code,
      checked: item.code === this.translateService.currentLang,
    }));

    const alert = await this.alertController.create({
      header: this.translations.SELECT_LANGUAGE,
      inputs: this.available_languages,
      cssClass: "language-alert",
      buttons: [
        {
          text: this.translations.CANCEL,
          role: "cancel",
          cssClass: "secondary",
          handler: () => {},
        },
        {
          text: this.translations.OK,
          handler: (data) => {
            if (data) {
              this.translateService.use(data);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  public getTerm(key: string, interpolateParams?: Object): string {
    let term;
    this.translateService.get(key, interpolateParams).subscribe((value) => {
      term = value;
    });
    return term;
  }
}

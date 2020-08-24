import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AlertController } from "@ionic/angular";
import { LanguageService } from "../language/language.service";

@Component({
  selector: "app-tab1",
  templateUrl: "tab1.page.html",
  styleUrls: ["tab1.page.scss"],
})
export class Tab1Page {
  available_languages = [];
  translations;

  constructor(
    private translateService: TranslateService,
    private languageService: LanguageService,
    private alertController: AlertController
  ) {}

  ngOnInit(): void {
    this.getTranslations();

    this.translateService.onLangChange.subscribe(() => {
      this.getTranslations();
    });
  }

  getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    this.translateService
      .getTranslation(this.translateService.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
      });
  }

  async openLanguageChooser() {
    this.available_languages = this.languageService
      .getLanguages()
      .map((item) => ({
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
}

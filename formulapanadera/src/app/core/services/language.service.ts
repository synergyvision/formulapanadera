import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

import { LanguageModel } from "../models/language.model";

import { LANGUAGE } from "src/app/config/configuration";

@Injectable()
export class LanguageService {
  languages: Array<LanguageModel> = new Array<LanguageModel>();
  translations;

  constructor(private translateService: TranslateService) {
    this.languages = LANGUAGE.available;
  }

  getLanguages() {
    return this.languages;
  }

  getCurrentLang() {
    return this.translateService.currentLang;
  }

  useLang(data: string) {
    this.translateService.use(data);
  }

  public initLanguages() {
    this.getTranslations();

    this.translateService.onLangChange.subscribe(() => {
      this.getTranslations();
    });
  }

  public getTranslations() {
    // get translations for this page to use in the Language Chooser Alert
    return this.translateService
      .getTranslation(this.translateService.currentLang)
      .subscribe((translations) => {
        this.translations = translations;
      });
  }

  public getTerm(key: string, interpolateParams?: Object): string {
    let term;
    this.translateService.get(key, interpolateParams).subscribe((value) => {
      term = value;
    });
    return term;
  }
}

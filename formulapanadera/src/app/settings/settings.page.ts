import { Component } from "@angular/core";

import { LanguageService } from "../utils/language/language.service";

@Component({
  selector: "app-settings",
  templateUrl: "settings.page.html",
  styleUrls: [
    "./styles/settings.page.scss",
    "./../utils/language/styles/change-language.alert.scss",
  ],
})
export class SettingsPage {
  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.initLanguages();
  }

  async openLanguageChooser() {
    await this.languageService.openLanguageChooser();
  }
}

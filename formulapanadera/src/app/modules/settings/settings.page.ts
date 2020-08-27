import { Component } from "@angular/core";

import { LanguageService } from "../../core/services/language.service";
import { AuthService } from "../../core/services/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-settings",
  templateUrl: "settings.page.html",
  styleUrls: [
    "./styles/settings.page.scss",
    "./../../utils/styles/change-language.alert.scss",
  ],
})
export class SettingsPage {
  constructor(
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.languageService.initLanguages();
  }

  async openLanguageChooser() {
    await this.languageService.openLanguageChooser();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      this.router.navigate(["auth/sign-in"], { replaceUrl: true });
    });
  }
}

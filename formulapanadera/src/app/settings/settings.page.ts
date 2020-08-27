import { Component } from "@angular/core";

import { LanguageService } from "../utils/language/language.service";
import { AuthService } from "../auth/auth.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-settings",
  templateUrl: "settings.page.html",
  styleUrls: [
    "./styles/settings.page.scss",
    "./../utils/language/styles/change-language.alert.scss",
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

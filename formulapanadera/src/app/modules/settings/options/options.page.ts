import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { UserModel } from "src/app/core/models/user.model";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
  ],
})
export class OptionsPage {
  ICONS = ICONS;
  APP_URL = APP_URL;

  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private languageAlert: LanguageAlert,
    private authService: AuthService,
    private userStorageService: UserStorageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = await this.userStorageService.getUser();
    if (!this.user) {
      this.router.navigate(
        [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
        { replaceUrl: true }
      );
    }
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      this.userStorageService.clear();
      this.router.navigate(
        [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
        { replaceUrl: true }
      );
    });
  }
}

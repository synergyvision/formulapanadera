import { Component } from "@angular/core";
import { LanguageService } from "../../../core/services/language.service";
import { AuthService } from "../../../core/services/auth.service";
import { Router } from "@angular/router";
import { UserModel } from "src/app/core/models/user.model";
import { Plugins } from "@capacitor/core";

const { Storage } = Plugins;

@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/styles/language.alert.scss",
  ],
})
export class OptionsPage {
  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.languageService.initLanguages();
    await Storage.get({ key: "user" }).then((data) => {
      if (data.value) {
        this.user = JSON.parse(data.value);
      } else {
        this.router.navigate(["auth/sign-in"], { replaceUrl: true });
      }
    });
  }

  async openLanguageChooser() {
    await this.languageService.openLanguageChooser();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      Storage.clear();
      this.router.navigate(["auth/sign-in"], { replaceUrl: true });
    });
  }
}

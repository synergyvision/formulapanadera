import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { UserModel } from "src/app/core/models/user.model";
import { Plugins } from "@capacitor/core";
import { LanguageAlert } from 'src/app/shared/alert/language/language.alert';

const { Storage } = Plugins;

@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
  ],
})
export class OptionsPage {
  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private languageAlert: LanguageAlert,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await Storage.get({ key: "user" }).then((data) => {
      if (data.value) {
        this.user = JSON.parse(data.value);
      } else {
        this.router.navigate(["auth/sign-in"], { replaceUrl: true });
      }
    });
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }

  signOut() {
    this.authService.signOut().subscribe(() => {
      Storage.clear();
      this.router.navigate(["auth/sign-in"], { replaceUrl: true });
    });
  }
}

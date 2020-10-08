import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { UserModel } from "src/app/core/models/user.model";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { AlertController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
    "./../../../shared/styles/confirm.alert.scss",
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
    private userStorageService: UserStorageService,
    private alertController: AlertController,
    private languageService: LanguageService
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

  async signOut() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.sign_out_question"),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.authService.signOut().subscribe(() => {
              this.userStorageService.clear();
              this.router.navigate(
                [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
                { replaceUrl: true }
              );
            });
          },
        },
      ],
    });
    await alert.present();
  }
}

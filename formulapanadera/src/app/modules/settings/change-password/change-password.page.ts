import { Component, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { PasswordValidator } from "../../../core/validators/password.validator";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { LoadingController, ToastController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.page.html",
  styleUrls: ["./styles/change-password.page.scss"],
})
export class ChangePasswordPage {
  APP_URL = APP_URL;
  ICONS = ICONS;

  passwordForm: FormGroup;
  matching_passwords_group: FormGroup;
  redirectLoader: HTMLIonLoadingElement;

  constructor(
    private authService: AuthService,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private languageService: LanguageService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.matching_passwords_group = new FormGroup(
      {
        password: new FormControl(
          "",
          Validators.compose([Validators.minLength(6), Validators.required])
        ),
        confirm_password: new FormControl("", Validators.required),
      },
      (formGroup: FormGroup) => {
        return PasswordValidator.areNotEqual(formGroup);
      }
    );

    this.passwordForm = new FormGroup({
      actual_password: new FormControl("", Validators.required),
      matching_passwords: this.matching_passwords_group,
    });
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  redirectToSettingsPage() {
    this.dismissLoading();
    this.ngZone.run(() => {
      const previousUrl =
        APP_URL.menu.name + "/" + APP_URL.menu.routes.settings.main;
      this.router.navigate([previousUrl], { replaceUrl: true });
    });
  }

  async updatePassword() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    const user = await this.userStorageService.getUser();
    const previous_password = this.passwordForm.value.actual_password;
    const password = this.passwordForm.value.matching_passwords.password;

    this.authService
      .signIn(user.email, previous_password)
      .then(() => {
        this.authService
          .updatePassword(password)
          .then(() => {
            this.redirectToSettingsPage();
          })
          .catch(() => {
            this.presentToast(false);
          });
      })
      .catch(() => {
        this.presentToast(false);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  async presentToast(success: boolean) {
    const toast = await this.toastController.create({
      message: success
        ? this.languageService.getTerm("send.success")
        : this.languageService.getTerm("send.error"),
      color: "secondary",
      duration: 5000,
      position: "top",
      buttons: [
        {
          icon: ICONS.close,
          role: "cancel",
          handler: () => {},
        },
      ],
    });
    toast.present();
  }
}

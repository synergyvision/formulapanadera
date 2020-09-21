import { Component, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { PasswordValidator } from "../../../core/validators/password.validator";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";

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
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;

  constructor(
    private authService: AuthService,
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

  resetSubmitError() {
    this.submitError = null;
  }

  updatePassword() {
    this.resetSubmitError();
    const password = this.passwordForm.value.matching_passwords.password;
    this.authService
      .updatePassword(password)
      .then(() => {
        this.redirectToSettingsPage();
      })
      .catch((error) => {
        this.submitError = error.message;
      });
  }
}

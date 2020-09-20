import { Component, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { PasswordValidator } from "../../../core/validators/password.validator";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { LanguageService } from "../../../core/services/language.service";
import { Router } from "@angular/router";
import { ValidationModel } from "src/app/core/models/validation.model";

@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.page.html",
  styleUrls: ["./styles/change-password.page.scss"],
})
export class ChangePasswordPage {
  passwordForm: FormGroup;
  matching_passwords_group: FormGroup;
  submitError: string;
  validation_messages: {
    password: Array<ValidationModel>;
    confirm_password: Array<ValidationModel>;
    matching_passwords: Array<ValidationModel>;
  };
  redirectLoader: HTMLIonLoadingElement;

  constructor(
    private authService: AuthService,
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
      matching_passwords: this.matching_passwords_group,
    });

    this.validation_messages = this.getValidationMessages();
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  redirectToSettingsPage() {
    this.dismissLoading();
    this.ngZone.run(() => {
      const previousUrl = "menu/settings";
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

  getValidationMessages(): {
    password: Array<ValidationModel>;
    confirm_password: Array<ValidationModel>;
    matching_passwords: Array<ValidationModel>;
  } {
    return {
      password: [
        {
          type: "required",
          message: this.languageService.getTerm("validation.required.password"),
        },
        {
          type: "minlength",
          message: this.languageService.getTerm(
            "validation.minlength.password",
            {
              number: "6",
            }
          ),
        },
      ],
      confirm_password: [
        {
          type: "required",
          message: this.languageService.getTerm(
            "validation.required.confirm_password"
          ),
        },
      ],
      matching_passwords: [
        {
          type: "areNotEqual",
          message: this.languageService.getTerm(
            "validation.areNotEqual.password"
          ),
        },
      ],
    };
  }
}

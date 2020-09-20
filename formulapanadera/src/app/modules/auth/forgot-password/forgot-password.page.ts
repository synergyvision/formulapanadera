import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { ValidationModel } from "src/app/core/models/validation.model";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { LanguageService } from "../../../core/services/language.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.page.html",
  styleUrls: [
    "./styles/forgot-password.page.scss",
    "./../../../shared/styles/language.alert.scss",
  ],
})
export class ForgotPasswordPage {
  forgotPasswordForm: FormGroup;
  submitError: string;
  validation_messages: {
    email: Array<ValidationModel>;
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private languageService: LanguageService,
    private languageAlert: LanguageAlert
  ) {
    this.forgotPasswordForm = new FormGroup({
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
        ])
      ),
    });
    this.validation_messages = this.getValidationMessages();
  }

  resetSubmitError() {
    this.submitError = null;
  }

  recoverPassword(): void {
    this.resetSubmitError();
    this.authService
      .recoverPassword(this.forgotPasswordForm.value.email)
      .then(() => {
        this.router.navigateByUrl("auth/sign-in");
      })
      .catch((error) => {
        this.submitError = error.message;
      });
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }

  getValidationMessages(): {
    email: Array<ValidationModel>;
  } {
    return {
      email: [
        {
          type: "required",
          message: this.languageService.getTerm("validation.required.email"),
        },
        {
          type: "pattern",
          message: this.languageService.getTerm("validation.pattern.email"),
        },
      ],
    };
  }
}

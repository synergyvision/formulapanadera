import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../auth.service";
import { LanguageService } from "src/app/utils/language/language.service";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.page.html",
  styleUrls: ["./styles/forgot-password.page.scss"],
})
export class ForgotPasswordPage implements OnInit {
  forgotPasswordForm: FormGroup;
  submitError: string;
  validation_messages: Object;

  constructor(
    private router: Router,
    private authService: AuthService,
    private languageService: LanguageService
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

  ngOnInit(): void {
    this.languageService.initLanguages();
  }

  resetSubmitError() {
    this.submitError = null;
  }

  recoverPassword(): void {
    this.resetSubmitError();
    this.authService
      .recoverPassword(this.forgotPasswordForm.value.email)
      .then(() => {
        this.router.navigateByUrl("/auth/sign-in");
      })
      .catch((error) => {
        this.submitError = error.message;
      });
  }

  async openLanguageChooser() {
    await this.languageService.openLanguageChooser();
  }

  getValidationMessages(): Object {
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

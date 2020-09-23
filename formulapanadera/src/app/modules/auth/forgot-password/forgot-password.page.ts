import { Component, OnInit } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { LanguageService } from "../../../core/services/language.service";

import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ASSETS } from "src/app/config/assets";

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.page.html",
  styleUrls: [
    "./styles/forgot-password.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
  ],
})
export class ForgotPasswordPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;
  ASSETS = ASSETS;

  forgotPasswordForm: FormGroup;
  submitError: string;

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
  }

  ngOnInit() {
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
        this.router.navigateByUrl(
          "/" + APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in
        );
      })
      .catch((error) => {
        this.submitError = error.message;
      });
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }
}

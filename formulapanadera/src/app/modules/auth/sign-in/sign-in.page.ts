import { Component, OnInit, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Subscription } from "rxjs";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { AuthService } from "../../../core/services/firebase/auth.service";

import { ASSETS } from "src/app/config/assets";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { UserStorageService } from "src/app/core/services/storage/user.service";

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: [
    "./styles/sign-in.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
  ],
})
export class SignInPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;
  ASSETS = ASSETS;

  loginForm: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private languageAlert: LanguageAlert,
    private userStorageService: UserStorageService
  ) {
    this.loginForm = new FormGroup({
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
        ])
      ),
      password: new FormControl(
        "",
        Validators.compose([Validators.minLength(6), Validators.required])
      ),
    });
  }

  async ngOnInit(): Promise<void> {
    let user = await this.userStorageService.getUser();
    if (user) {
      this.redirectLoggedUserToMainPage();
    }
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user
  redirectLoggedUserToMainPage() {
    this.dismissLoading();

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      const previousUrl =
        "/" + APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main;

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      this.router.navigate([previousUrl], { replaceUrl: true });
    });
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  resetSubmitError() {
    this.submitError = null;
  }

  signIn() {
    this.resetSubmitError();
    this.authService
      .signIn(this.loginForm.value["email"], this.loginForm.value["password"])
      .then((loggedUser) => {
        this.userStorageService.setUser({
          name: loggedUser.user.displayName,
          email: loggedUser.user.email,
        });
        this.redirectLoggedUserToMainPage();
      })
      .catch((error) => {
        this.submitError = error.message;
        this.dismissLoading();
      });
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }
}

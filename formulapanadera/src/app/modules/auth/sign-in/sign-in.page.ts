import { Component, OnInit, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Plugins } from "@capacitor/core";
import { Subscription } from "rxjs";
import { ValidationModel } from "src/app/core/models/validation.model";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { LanguageService } from "../../../core/services/language.service";

const { Storage } = Plugins;

@Component({
  selector: "app-sign-in",
  templateUrl: "./sign-in.page.html",
  styleUrls: [
    "./styles/sign-in.page.scss",
    "./../../../shared/styles/language.alert.scss",
  ],
})
export class SignInPage implements OnInit {
  loginForm: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;
  validation_messages: {
    email: Array<ValidationModel>;
    password: Array<ValidationModel>;
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private languageService: LanguageService,
    private languageAlert: LanguageAlert
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

    this.validation_messages = this.getValidationMessages();
  }

  ngOnInit(): void {
    Storage.get({ key: "user" }).then((data) => {
      if (data.value) {
        this.redirectLoggedUserToMainPage();
      }
    });
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user
  redirectLoggedUserToMainPage() {
    this.dismissLoading();

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      const previousUrl = "menu/production";

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
    let user: string;
    this.authService
      .signIn(this.loginForm.value["email"], this.loginForm.value["password"])
      .then((loggedUser) => {
        user = JSON.stringify({
          name: loggedUser.user.displayName,
          email: loggedUser.user.email,
        });
        Storage.set({ key: "user", value: user });
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

  getValidationMessages(): {
    email: Array<ValidationModel>;
    password: Array<ValidationModel>;
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
    };
  }
}

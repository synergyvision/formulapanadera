import { Component, OnInit, NgZone } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { PasswordValidator } from "../../../core/validators/password.validator";
import { AuthService } from "../../../core/services/auth.service";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../core/services/language.service";

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.page.html",
  styleUrls: [
    "./styles/sign-up.page.scss",
    "./../../../utils/styles/change-language.alert.scss",
  ],
})
export class SignUpPage implements OnInit {
  signupForm: FormGroup;
  matching_passwords_group: FormGroup;
  submitError: string;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;
  validation_messages: Object;

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private languageService: LanguageService
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

    this.signupForm = new FormGroup({
      fullName: new FormControl("", Validators.compose([Validators.required])),
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$"),
        ])
      ),
      matching_passwords: this.matching_passwords_group,
    });

    this.validation_messages = this.getValidationMessages();
  }

  ngOnInit(): void {
    this.languageService.initLanguages();
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

  signUp(): void {
    this.resetSubmitError();
    const values = this.signupForm.value;
    this.authService
      .signUp(values.email, values.matching_passwords.password)
      .then((result) => {
        result.user.updateProfile({ displayName: values.fullName });
        this.redirectLoggedUserToMainPage();
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
      fullName: [
        {
          type: "required",
          message: this.languageService.getTerm("validation.required.name"),
        },
      ],
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

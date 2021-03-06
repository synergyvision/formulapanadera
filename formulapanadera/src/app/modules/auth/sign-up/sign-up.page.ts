import { Component, NgZone, OnInit } from "@angular/core";
import { Validators, FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { PasswordValidator } from "../../../core/validators/password.validator";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Subscription } from "rxjs";
import { LanguageService } from "../../../core/services/language.service";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ASSETS } from "src/app/config/assets";
import { LoadingController, ToastController } from "@ionic/angular";
import { UserCRUDService } from 'src/app/core/services/firebase/user.service';
import { UserModel } from 'src/app/core/models/user.model';

@Component({
  selector: "app-sign-up",
  templateUrl: "./sign-up.page.html",
  styleUrls: [
    "./styles/sign-up.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
  ],
})
export class SignUpPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;
  ASSETS = ASSETS;

  signupForm: FormGroup;
  matching_passwords_group: FormGroup;
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;

  user: UserModel = new UserModel();

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private languageService: LanguageService,
    private languageAlert: LanguageAlert,
    private userCRUDService: UserCRUDService,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private toastController: ToastController
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
  }

  ngOnInit() {
    this.languageService.initLanguages();
  }

  // Once the auth provider finished the authentication flow, and the auth redirect completes,
  // hide the loader and redirect the user
  redirectLoggedUserToMainPage() {
    this.dismissLoading();

    // As we are calling the Angular router navigation inside a subscribe method, the navigation will be triggered outside Angular zone.
    // That's why we need to wrap the router navigation call inside an ngZone wrapper
    this.ngZone.run(() => {
      const previousUrl =
        APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main;

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      this.router.navigate([previousUrl], { replaceUrl: true });
    });
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  async signUp() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    const values = this.signupForm.value;
    this.authService
      .signUp(values.email, values.matching_passwords.password)
      .then(async (result) => {
        this.user.name = values.fullName;
        this.user.email = values.email;
        this.user.user_groups = [];
        this.user.role = 'FREE';
        this.userCRUDService
          .createUser(result.user.uid, this.user)
          .then(async () => {
            this.user.id = result.user.uid
            await this.userStorageService.setUser(this.user);
            this.redirectLoggedUserToMainPage();
          })
      })
      .catch((error) => {
        this.dismissLoading();
        this.presentToast(error.code);
      })
      .finally(async () => {
        await loading.dismiss();
      });
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }

  async presentToast(type: string) {
    let message = this.languageService.getTerm("send.error");
    if (type == "auth/email-already-in-use") {
      message = this.languageService.getTerm("send.user_exists_error");
    }

    const toast = await this.toastController.create({
      message: message,
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

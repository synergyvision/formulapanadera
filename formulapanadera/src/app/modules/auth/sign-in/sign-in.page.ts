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
import { LoadingController, ToastController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { UserCRUDService } from 'src/app/core/services/firebase/user.service';

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
  redirectLoader: HTMLIonLoadingElement;
  authRedirectResult: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private languageAlert: LanguageAlert,
    private userCRUDService: UserCRUDService,
    private userStorageService: UserStorageService,
    private loadingController: LoadingController,
    private languageService: LanguageService,
    private toastController: ToastController
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
        "/" + APP_URL.menu.name + "/" + APP_URL.menu.routes.formula.main;

      // No need to store in the navigation history the sign-in page with redirect params (it's justa a mandatory mid-step)
      this.router.navigate([previousUrl], { replaceUrl: true });
    });
  }

  async dismissLoading() {
    if (this.redirectLoader) {
      await this.redirectLoader.dismiss();
    }
  }

  async signIn() {
    const loading = await this.loadingController.create({
      cssClass: "app-send-loading",
      message: this.languageService.getTerm("loading"),
    });
    await loading.present();

    this.authService
      .signIn(this.loginForm.value["email"], this.loginForm.value["password"])
      .then((loggedUser) => {
        this.userCRUDService
          .getUserDataSource(loggedUser.user.uid)
          .subscribe((userdata) => {
            if (userdata) {
              userdata.id = loggedUser.user.uid;
              this.userStorageService.setUser(userdata);
              this.redirectLoggedUserToMainPage();
            }
          });
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
    if (type == "auth/wrong-password") {
      message = this.languageService.getTerm("send.password_error");
    } else if (type == "auth/user-not-found") {
      message = this.languageService.getTerm("send.user_error");
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

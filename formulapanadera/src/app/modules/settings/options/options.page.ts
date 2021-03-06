import { Component } from "@angular/core";
import { AuthService } from "../../../core/services/firebase/auth.service";
import { Router } from "@angular/router";
import { UserResumeModel } from "src/app/core/models/user.model";
import { LanguageAlert } from "src/app/shared/alert/language/language.alert";
import { UserStorageService } from "src/app/core/services/storage/user.service";
import { ANDROID_MARKET, APP_URL, IOS_MARKET, REPORT_TO } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { HELP_CENTER } from 'src/app/config/configuration';
import { AlertController, IonRouterOutlet, ModalController } from "@ionic/angular";
import { LanguageService } from "src/app/core/services/language.service";
import { AboutUsComponent } from "src/app/shared/modal/about-us/about-us.component";
import { TermConditionsComponent } from "src/app/shared/modal/term-conditions/term-conditions.component";
import { Plugins } from '@capacitor/core'
const { Browser, Share, Device } = Plugins;
@Component({
  selector: "app-options",
  templateUrl: "options.page.html",
  styleUrls: [
    "./styles/options.page.scss",
    "./../../../shared/alert/language/styles/language.alert.scss",
    "./../../../shared/styles/confirm.alert.scss",
  ],
})
export class OptionsPage {
  ICONS = ICONS;
  APP_URL = APP_URL;

  user: UserResumeModel = new UserResumeModel();

  constructor(
    private router: Router,
    private languageAlert: LanguageAlert,
    private authService: AuthService,
    private userStorageService: UserStorageService,
    private alertController: AlertController,
    private languageService: LanguageService,
    private modalController: ModalController,
    private routerOutlet: IonRouterOutlet
  ) {}

  async ngOnInit(): Promise<void> {
    let user = await this.userStorageService.getUser();
    this.user = {name: user.name, email: user.email}
    if (!this.user) {
      this.router.navigate(
        [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
        { replaceUrl: true }
      );
    }
  }

  async openLanguageChooser() {
    await this.languageAlert.openLanguageChooser();
  }

  async openAboutUs() {
    const modal = await this.modalController.create({
      component: AboutUsComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl
    })
    await modal.present();
  }

  async openTermsConditionModal(terms) {
    const modal = await this.modalController.create({
      component: TermConditionsComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        terms
      }
    })
    await modal.present();
  }

  async openPrivacyPolicyModal(terms) {
    const modal = await this.modalController.create({
      component: TermConditionsComponent,
      swipeToClose: true,
      presentingElement: this.routerOutlet.nativeEl,
      componentProps: {
        terms
      }
    })
    await modal.present();
  }

  async signOut() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("action.confirm"),
      message: this.languageService.getTerm("action.sign_out_question"),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("action.cancel"),
          role: "cancel",
          handler: () => {},
        },
        {
          text: this.languageService.getTerm("action.ok"),
          cssClass: "confirm-alert-accept",
          handler: () => {
            this.authService.signOut().subscribe(() => {
              this.userStorageService.clear();
              this.router.navigate(
                [APP_URL.auth.name + "/" + APP_URL.auth.routes.sign_in],
                { replaceUrl: true }
              );
            });
          },
        },
      ],
    });
    await alert.present();
  }

  reportProblem() {    
    Browser.open({
      url: `mailto:${REPORT_TO}`,
      windowName: '_system'
    })
    // Email plugin
  }

  async openHelpCenter() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("help_center.name"),
      message: this.languageService.getTerm("help_center.content"),
      cssClass: "confirm-alert",
      buttons: [
        {
          text: this.languageService.getTerm("help_center.whatsapp"),
          handler: () => {
            Browser.open({
              url: HELP_CENTER.wa,
              windowName: '_system'
            });
          }
        },
        {
          text: this.languageService.getTerm("help_center.telegram"),
          cssClass: 'normal-font-weight',
          handler: () => {
            Browser.open({
              url: HELP_CENTER.telegram,
              windowName: '_system'
            })
          }
        }
      ],
    });
    await alert.present();
  }

  shareApp() {
    Share.share({
      title: this.languageService.getTerm("social_sharing.title"),
      text: this.languageService.getTerm("social_sharing.message")
      .replace("{iosUrl}", IOS_MARKET)
      .replace("{androidUrl}", ANDROID_MARKET)
    })
  }

  async rateApp() {
    const alert = await this.alertController.create({
      header: this.languageService.getTerm("rate_app.title"),
      message: this.languageService.getTerm("rate_app.message"),
      cssClass: "vertical-buttons-group",
      buttons: [
        {
          text: this.languageService.getTerm("rate_app.cancel"),
          handler: () => { }

        },
        {
          text: this.languageService.getTerm("rate_app.rate"),
          cssClass: 'normal-font-weight',
          handler: () => {
            Device.getInfo().then((info) => {
              if (info.platform == "android") {
                Browser.open({
                  url: ANDROID_MARKET,
                  windowName: '_system',
                })
              } else if (info.platform == "ios") {
                Browser.open({
                  url: IOS_MARKET,
                  windowName: "_system"
                })
              }
            });
          }
        }
      ],
    });
    await alert.present();
  }
}

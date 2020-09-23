import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { TranslateService } from "@ngx-translate/core";

import { LANGUAGE } from "./config/configuration";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: [],
})
export class AppComponent {
  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar
  ) {
    this.initializeApp();
    this.setLanguage();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  setLanguage() {
    this.translate.setDefaultLang(LANGUAGE.default);
    this.translate.use(LANGUAGE.default);
  }
}

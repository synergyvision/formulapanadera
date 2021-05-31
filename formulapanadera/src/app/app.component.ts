import { Component, OnDestroy } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";

import { TranslateService } from "@ngx-translate/core";

import { LANGUAGE } from "./config/configuration";
import { LanguageStorageService } from './core/services/storage/language.service';
import { NetworkService } from "./core/services/network.service";
import { OfflineManagerService } from "./core/services/offline-manager.service";
import { StorageService } from "./core/services/storage/storage.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: [],
})
export class AppComponent implements OnDestroy {

  constructor(
    private translate: TranslateService,
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private languageStorageService: LanguageStorageService,
    private networkService: NetworkService,
    private offlineManager: OfflineManagerService,
    private storageService: StorageService
    
  ) {
    this.initializeApp();
    this.setLanguage();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      await this.networkService.initializeNetworkEvents();
      await this.storageService.init();
      this.splashScreen.hide();

      this.networkService.onNetworkChange().subscribe(() => {
        if (this.networkService.isConnectedToNetwork()) {
          this.offlineManager.checkForEvents().subscribe();
        }
      });
    });
  }

  ngOnDestroy() {
    this.networkService.removeNetworkStatus();
  }
  
  async setLanguage() {
    let language = await this.languageStorageService.getLanguage()
    let exists: boolean = false
    if (language) {
      LANGUAGE.available.forEach(lang => {
        if (lang.code == language.code) {
          exists = true
        }
      })
    }
    if (language && exists) {
      this.translate.setDefaultLang(language.code);
      this.translate.use(language.code);
    } else {
      this.translate.setDefaultLang(LANGUAGE.default);
      this.translate.use(LANGUAGE.default);
    }
  }
}

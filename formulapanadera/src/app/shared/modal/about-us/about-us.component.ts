import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ICONS } from "src/app/config/icons";

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent implements OnInit {
  ICONS = ICONS;
  version: string;
  constructor(
    private platform: Platform,
    private translateService: TranslateService,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        // Get version
      } else {
        this.version = this.translateService.instant('about_us.callback_version');
      }
    })
  }

  dismissModal() {
    this.modalController.dismiss();
  }

}

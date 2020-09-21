import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ActionSheetController } from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";
import { ICONS } from "src/app/config/icons";
import { ProductionModel } from "src/app/core/models/production.model";
import { LanguageService } from "src/app/core/services/language.service";

@Component({
  selector: "app-production-details",
  templateUrl: "production-details.page.html",
  styleUrls: ["./styles/production-details.page.scss"],
})
export class ProductionDetailsPage implements OnInit {
  APP_URL = APP_URL;
  ICONS = ICONS;

  production: ProductionModel = new ProductionModel();

  state;

  constructor(
    private languageService: LanguageService,
    private router: Router,
    private actionSheetController: ActionSheetController
  ) {
    this.state = this.router.getCurrentNavigation().extras.state;
  }

  async ngOnInit() {
    if (this.state === undefined) {
      this.router.navigateByUrl(
        APP_URL.menu.name + "/" + APP_URL.menu.routes.production.main
      );
    } else {
      this.production = this.state.production;
    }
  }

  async presentOptions() {
    const actionSheet = await this.actionSheetController.create({
      cssClass: "formula-options",
      buttons: [
        {
          text: this.languageService.getTerm("action.update"),
          icon: ICONS.create,
          cssClass: "action-icon",
          handler: () => {
            this.updateProduction();
          },
        },
        {
          text: this.languageService.getTerm("action.cancel"),
          icon: ICONS.close,
          role: "cancel",
          cssClass: "cancel-icon",
          handler: () => {},
        },
      ],
    });
    await actionSheet.present();
  }

  updateProduction() {
    this.router.navigateByUrl(
      APP_URL.menu.name +
        "/" +
        APP_URL.menu.routes.production.main +
        "/" +
        APP_URL.menu.routes.production.routes.management,
      {
        state: { production: this.production },
      }
    );
  }
}

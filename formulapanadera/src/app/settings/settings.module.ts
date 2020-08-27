import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { LanguageService } from "../utils/language/language.service";
import { SettingsPage } from "./settings.page";

import { SettingsPageRoutingModule } from "./settings-routing.module";
import { AuthService } from '../auth/auth.service';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SettingsPageRoutingModule,
    TranslateModule,
  ],
  declarations: [SettingsPage],
  providers: [LanguageService, AuthService],
})
export class SettingsPageModule {}

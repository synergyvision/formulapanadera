import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { LanguageService } from "../../../core/services/language.service";
import { OptionsPage } from "./options.page";
import { ProfileResolver } from "../../../core/resolvers/profile.resolver";

const routes: Routes = [
  {
    path: "",
    component: OptionsPage,
    resolve: {
      data: ProfileResolver,
    },
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [OptionsPage],
  providers: [LanguageService, ProfileResolver],
})
export class SettingsPageModule {}

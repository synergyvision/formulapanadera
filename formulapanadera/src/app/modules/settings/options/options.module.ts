import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { OptionsPage } from "./options.page";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { AppRate } from "@ionic-native/app-rate/ngx";

const routes: Routes = [
  {
    path: "",
    component: OptionsPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [OptionsPage],
  providers: [AppRate]
})
export class OptionsPageModule {}

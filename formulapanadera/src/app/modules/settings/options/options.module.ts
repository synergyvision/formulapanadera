import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { OptionsPage } from "./options.page";

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
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [OptionsPage],
})
export class OptionsPageModule {}

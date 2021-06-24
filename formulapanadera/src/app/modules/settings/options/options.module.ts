import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { OptionsPage } from "./options.page";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

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
    DirectivesModule
  ],
  declarations: [OptionsPage],
})
export class OptionsPageModule {}

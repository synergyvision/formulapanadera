import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { ChangePasswordPage } from "./change-password.page";
import { ComponentsModule } from "../../../shared/components/components.module";
import { LanguageService } from "src/app/core/services/language.service";
import { TranslateModule } from "@ngx-translate/core";

const routes: Routes = [
  {
    path: "",
    component: ChangePasswordPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
  ],
  declarations: [ChangePasswordPage],
  providers: [LanguageService],
})
export class ChangePasswordPageModule {}

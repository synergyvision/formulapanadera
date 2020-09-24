import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaManagePage } from "./formula-manage.page";
import { ComponentsModule } from "src/app/shared/components/components.module";

const routes: Routes = [
  {
    path: "",
    component: FormulaManagePage,
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
  declarations: [FormulaManagePage],
})
export class FormulaManagePageModule {}

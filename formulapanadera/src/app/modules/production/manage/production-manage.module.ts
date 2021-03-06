import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { ProductionManagePage } from "./production-manage.page";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

const routes: Routes = [
  {
    path: "",
    component: ProductionManagePage,
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
    DirectivesModule
  ],
  declarations: [ProductionManagePage],
})
export class ProductionManagePageModule {}

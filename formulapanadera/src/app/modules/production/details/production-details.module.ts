import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ProductionDetailsPage } from "./production-details.page";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

const routes: Routes = [
  {
    path: "",
    component: ProductionDetailsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule
  ],
  declarations: [ProductionDetailsPage],
})
export class ProductionDetailsPageModule {}

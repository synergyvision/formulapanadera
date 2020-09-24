import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";

import { ProductionListingPage } from "./production-listing.page";

const routes: Routes = [
  {
    path: "",
    component: ProductionListingPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule,
  ],
  declarations: [ProductionListingPage],
})
export class ProductionListingPageModule {}

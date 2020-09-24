import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";

import { FormulaListingPage } from "./formula-listing.page";

const routes: Routes = [
  {
    path: "",
    component: FormulaListingPage,
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
  declarations: [FormulaListingPage],
})
export class FormulaListingPageModule {}

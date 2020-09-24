import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../../shared/components/components.module";

import { IngredientListingPage } from "./ingredient-listing.page";

const routes: Routes = [
  {
    path: "",
    component: IngredientListingPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [IngredientListingPage],
})
export class IngredientListingPageModule {}

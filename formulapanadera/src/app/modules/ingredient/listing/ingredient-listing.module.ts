import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { TranslateModule } from "@ngx-translate/core";
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
  ],
  declarations: [IngredientListingPage],
})
export class IngredientListingPageModule {}

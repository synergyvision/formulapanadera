import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../../shared/components/components.module";

import { IngredientListingPage } from "./ingredient-listing.page";
import { IngredientListingResolver } from "../../../core/resolvers/ingredient-listing.resolver";

const routes: Routes = [
  {
    path: "",
    component: IngredientListingPage,
    resolve: {
      data: IngredientListingResolver,
    },
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
  providers: [IngredientListingResolver],
})
export class IngredientListingPageModule {}

import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "../../../shared/components/components.module";

import { IngredientListingPage } from "./ingredient-listing.page";
import { IngredientService } from "../../../core/services/ingredient.service";
import { IngredientListingResolver } from "../../../core/resolvers/ingredient-listing.resolver";

import { IngredientManagementModal } from "../management/ingredient-management.modal";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";

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
  declarations: [IngredientListingPage, IngredientManagementModal],
  entryComponents: [IngredientManagementModal],
  providers: [
    IngredientListingResolver,
  ],
})
export class IngredientListingPageModule {}

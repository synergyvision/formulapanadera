import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaManagePage } from "./formula-manage.page";
import { IngredientPickerModal } from "../modal/ingredient/ingredient-picker.modal";
import { IngredientListingResolver } from "src/app/core/resolvers/ingredient-listing.resolver";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { IngredientMixingModal } from "../modal/mixing/ingredient-mixing.modal";
import { FormulaStepsModal } from "../modal/steps/formula-steps.modal";
import { LanguageService } from "src/app/core/services/language.service";
import { FormatNumberService } from "src/app/core/services/format-number.service";

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
  declarations: [
    FormulaManagePage,
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaStepsModal,
  ],
  entryComponents: [
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaStepsModal,
  ],
  providers: [IngredientListingResolver, LanguageService, FormatNumberService],
})
export class FormulaManagePageModule {}

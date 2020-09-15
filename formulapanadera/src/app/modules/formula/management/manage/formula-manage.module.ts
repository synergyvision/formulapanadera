import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaManagePage } from "./formula-manage.page";
import { IngredientListingResolver } from "src/app/core/resolvers/ingredient-listing.resolver";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { FormulaStepsModal } from "../steps/formula-steps.modal";
import { IngredientPickerModal } from 'src/app/shared/modal/ingredient/ingredient-picker.modal';
import { IngredientMixingModal } from 'src/app/shared/modal/mixing/ingredient-mixing.modal';

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
  providers: [IngredientListingResolver],
})
export class FormulaManagePageModule {}
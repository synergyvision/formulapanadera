import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IngredientListingResolver } from "src/app/core/resolvers/ingredient-listing.resolver";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { IngredientPickerModal } from 'src/app/shared/modal/ingredient/ingredient-picker.modal';
import { IngredientMixingModal } from 'src/app/shared/modal/mixing/ingredient-mixing.modal';
import { IngredientManagePage } from './ingredient-manage.page';

const routes: Routes = [
  {
    path: "",
    component: IngredientManagePage,
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
    IngredientManagePage,
    IngredientPickerModal,
    IngredientMixingModal,
  ],
  entryComponents: [
    IngredientPickerModal,
    IngredientMixingModal,
  ],
  providers: [IngredientListingResolver],
})
export class IngredientManagePageModule { }

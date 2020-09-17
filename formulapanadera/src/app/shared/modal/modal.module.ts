import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IngredientPickerModal } from "./ingredient/ingredient-picker.modal";
import { IngredientMixingModal } from "./mixing/ingredient-mixing.modal";
import { ComponentsModule } from "../components/components.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
  ],
  declarations: [IngredientPickerModal, IngredientMixingModal],
  exports: [IngredientPickerModal, IngredientMixingModal],
})
export class ModalModule {}

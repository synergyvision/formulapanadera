import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { IngredientPickerModal } from "./ingredient/ingredient-picker.modal";
import { IngredientMixingModal } from "./mixing/ingredient-mixing.modal";
import { ComponentsModule } from "../components/components.module";
import { FormulaStepsModal } from "./steps/formula-steps.modal";
import { FormulaPickerModal } from "./formula/formula-picker.modal";
import { UserGroupPickerModal } from './user-group/user-group-picker.modal';
import { OrganolepticCharacteristicsModal } from "./organoleptic-characteristics/organoleptic-characteristics.modal";
import { ReferencesModal } from "./references/references.modal";
import { SharedUsersModal } from "./shared-users/shared-users.modal";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
  ],
  declarations: [
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaPickerModal,
    FormulaStepsModal,
    OrganolepticCharacteristicsModal,
    ReferencesModal,
    UserGroupPickerModal,
    SharedUsersModal
  ],
  exports: [
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaPickerModal,
    FormulaStepsModal,
    OrganolepticCharacteristicsModal,
    ReferencesModal,
    UserGroupPickerModal,
    SharedUsersModal
  ],
})
export class ModalModule {}

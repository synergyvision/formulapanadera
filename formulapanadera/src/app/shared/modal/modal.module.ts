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
import { ProductionPickerModal } from "./production/production-picker.modal";
import { AboutUsComponent } from "./about-us/about-us.component";
import { TermConditionsComponent } from "./term-conditions/term-conditions.component";
import { DirectivesModule } from '../directives/directives.module'
import { NotesModal } from "./notes/notes.modal";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaPickerModal,
    FormulaStepsModal,
    ProductionPickerModal,
    OrganolepticCharacteristicsModal,
    NotesModal,
    ReferencesModal,
    UserGroupPickerModal,
    SharedUsersModal,
    AboutUsComponent,
    TermConditionsComponent,
  ],
  exports: [
    IngredientPickerModal,
    IngredientMixingModal,
    FormulaPickerModal,
    FormulaStepsModal,
    ProductionPickerModal,
    OrganolepticCharacteristicsModal,
    NotesModal,
    ReferencesModal,
    UserGroupPickerModal,
    SharedUsersModal,
    AboutUsComponent,
    TermConditionsComponent,
  ],
})
export class ModalModule {}

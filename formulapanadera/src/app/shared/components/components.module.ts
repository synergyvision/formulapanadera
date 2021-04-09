import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { ShellModule } from "../shell/shell.module";

import { ShowHidePasswordComponent } from "./auth/show-hide-password/show-hide-password.component";
import { ShowHideContentComponent } from "./general/show-hide-content/show-hide-content.component";
import { IngredientItemComponent } from "./ingredient/ingredient-item/ingredient-item.component";
import { FormulaItemComponent } from "./formula/formula-item/formula-item.component";
import { IngredientsListComponent } from "./ingredient/ingredients-list/ingredients-list.component";
import { FormulaStepDetailsComponent } from "./formula/formula-step-details/formula-step-details.component";
import { MixingStepsComponent } from "./formula/mixing-steps/mixing-steps.component";
import { HydrationBarComponent } from "./formula/hydration-bar/hydration-bar.component";
import { FatBarComponent } from "./formula/fat-bar/fat-bar.component";
import { FormulasListComponent } from "./production/formulas-list/formulas-list.component";
import { ProductionIngredientsComponent } from "./production/production-ingredients/production-ingredients.component";
import { ProductionItemComponent } from "./production/production-item/production-item.component";
import { FormulasIngredientsListComponent } from "./production/formulas-ingredients-list/formulas-ingredients-list.component";
import { TitleComponent } from "./general/title/title.component";
import { FormulaTimeTableComponent } from "./formula/formula-time-table/formula-time-table.component";
import { ProductionStepItemComponent } from "./production/production-step-item/production-step-item.component";
import { DataItemComponent } from "./general/data-item/data-item.component";
import { DividerComponent } from "./general/divider/divider.component";
import { FormulaStepComponent } from './formula/formula-step/formula-step.component';
import { UserGroupItemComponent } from './user-group/user-group-item/user-group-item.component';
import { OrganolepticCharacteristicsComponent } from "./formula/organoleptic-characteristics/organoleptic-characteristics.component";
import { ReferencesComponent } from "./general/references/references.component";
import { UserItemComponent } from "./user-group/user-item/user-item.component";
import { FormulaMixingComponent } from "./formula/formula-mixing/formula-mixing.component";
import { TitleDividerComponent } from "./general/title-divider/title-divider.component";
import { CourseItemComponent } from "./course/course-item/course-item.component";
import { SharedCourseItemComponent } from "./course/shared-course-item/shared-course-item.component";
import { NotesComponent } from "./general/notes/notes.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShellModule,
    TranslateModule,
  ],
  declarations: [
    TitleComponent,
    DataItemComponent,
    DividerComponent,
    TitleDividerComponent,
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    FatBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaTimeTableComponent,
    FormulaStepComponent,
    FormulaStepDetailsComponent,
    FormulaMixingComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionStepItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
    OrganolepticCharacteristicsComponent,
    NotesComponent,
    ReferencesComponent,
    UserItemComponent,
    UserGroupItemComponent,
    CourseItemComponent,
    SharedCourseItemComponent,
  ],
  exports: [
    TitleComponent,
    DataItemComponent,
    DividerComponent,
    TitleDividerComponent,
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    FatBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaTimeTableComponent,
    FormulaStepComponent,
    FormulaStepDetailsComponent,
    FormulaMixingComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionStepItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
    OrganolepticCharacteristicsComponent,
    NotesComponent,
    ReferencesComponent,
    UserItemComponent,
    UserGroupItemComponent,
    CourseItemComponent,
    SharedCourseItemComponent,
    ShellModule,
  ],
})
export class ComponentsModule {}

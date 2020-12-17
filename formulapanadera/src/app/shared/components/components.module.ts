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
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaTimeTableComponent,
    FormulaStepComponent,
    FormulaStepDetailsComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionStepItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
    UserGroupItemComponent,
  ],
  exports: [
    TitleComponent,
    DataItemComponent,
    DividerComponent,
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaTimeTableComponent,
    FormulaStepComponent,
    FormulaStepDetailsComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionStepItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
    UserGroupItemComponent,
    ShellModule,
  ],
})
export class ComponentsModule {}

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
import { FormulaStepComponent } from "./formula/formula-step/formula-step.component";
import { MixingStepsComponent } from "./formula/mixing-steps/mixing-steps.component";
import { HydrationBarComponent } from "./formula/hydration-bar/hydration-bar.component";
import { FormulasListComponent } from "./production/formulas-list/formulas-list.component";
import { ProductionIngredientsComponent } from "./production/production-ingredients/production-ingredients.component";
import { ProductionItemComponent } from "./production/production-item/production-item.component";
import { FormulasIngredientsListComponent } from "./production/formulas-ingredients-list/formulas-ingredients-list.component";
import { TitleComponent } from "./general/title/title.component";

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
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaStepComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
  ],
  exports: [
    TitleComponent,
    ShowHidePasswordComponent,
    ShowHideContentComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulasListComponent,
    FormulaStepComponent,
    MixingStepsComponent,
    ProductionItemComponent,
    ProductionIngredientsComponent,
    FormulasIngredientsListComponent,
    ShellModule,
  ],
})
export class ComponentsModule {}

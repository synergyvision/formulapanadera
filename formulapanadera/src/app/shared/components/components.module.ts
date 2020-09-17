import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";

import { ShellModule } from "../shell/shell.module";

import { ShowHidePasswordComponent } from "./show-hide-password/show-hide-password.component";
import { IngredientItemComponent } from "./ingredient-item/ingredient-item.component";
import { FormulaItemComponent } from "./formula-item/formula-item.component";
import { IngredientsListComponent } from "./ingredients-list/ingredients-list.component";
import { FormulaStepComponent } from "./formula-step/formula-step.component";
import { MixingStepsComponent } from "./mixing-steps/mixing-steps.component";
import { HydrationBarComponent } from "./hydration-bar/hydration-bar.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ShellModule,
    TranslateModule,
  ],
  declarations: [
    ShowHidePasswordComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulaStepComponent,
    MixingStepsComponent,
  ],
  exports: [
    ShowHidePasswordComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    HydrationBarComponent,
    IngredientsListComponent,
    FormulaStepComponent,
    MixingStepsComponent,
    ShellModule,
  ],
})
export class ComponentsModule {}

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
import { FormulaStepsComponent } from "./formula-steps/formula-steps.component";
import { MixingStepsComponent } from "./mixing-steps/mixing-steps.component";

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
    IngredientsListComponent,
    FormulaStepsComponent,
    MixingStepsComponent,
  ],
  exports: [
    ShowHidePasswordComponent,
    IngredientItemComponent,
    FormulaItemComponent,
    IngredientsListComponent,
    FormulaStepsComponent,
    MixingStepsComponent,
    ShellModule,
  ],
})
export class ComponentsModule {}

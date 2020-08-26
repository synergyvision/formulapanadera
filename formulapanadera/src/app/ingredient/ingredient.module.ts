import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { IngredientPage } from "./ingredient.page";

import { IngredientPageRoutingModule } from "./ingredient-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: "", component: IngredientPage }]),
    IngredientPageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [IngredientPage],
})
export class IngredientPageModule {}

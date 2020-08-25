import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { RecipePage } from "./recipe.page";

import { RecipePageRoutingModule } from "./recipe-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RecipePageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [RecipePage],
})
export class RecipePageModule {}

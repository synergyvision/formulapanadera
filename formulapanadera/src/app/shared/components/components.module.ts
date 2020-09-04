import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { ShellModule } from "../shell/shell.module";

import { ShowHidePasswordComponent } from "./show-hide-password/show-hide-password.component";
import { IngredientItemComponent } from "./ingredient-item/ingredient-item.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ShellModule],
  declarations: [ShowHidePasswordComponent, IngredientItemComponent],
  exports: [ShowHidePasswordComponent, IngredientItemComponent, ShellModule],
})
export class ComponentsModule {}

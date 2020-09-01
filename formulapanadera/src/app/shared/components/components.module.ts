import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { ShellModule } from "../shell/shell.module";

import { ShowHidePasswordComponent } from "./show-hide-password/show-hide-password.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ShellModule],
  declarations: [ShowHidePasswordComponent],
  exports: [ShowHidePasswordComponent, ShellModule],
})
export class ComponentsModule {}

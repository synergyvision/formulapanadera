import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";

import { ShowHidePasswordComponent } from "./show-hide-password/show-hide-password.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule],
  declarations: [ShowHidePasswordComponent],
  exports: [ShowHidePasswordComponent],
})
export class ComponentsModule {}

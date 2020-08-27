import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaPage } from "./formula.page";

import { FormulaPageRoutingModule } from "./formula-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    FormulaPageRoutingModule,
    TranslateModule.forChild(),
  ],
  declarations: [FormulaPage],
})
export class FormulaPageModule {}

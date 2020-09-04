import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaDetailsPage } from "./formula-details.page";
import { FormulaService } from "src/app/core/services/formula.service";

const routes: Routes = [
  {
    path: "",
    component: FormulaDetailsPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
  ],
  declarations: [FormulaDetailsPage],
  providers: [FormulaService],
})
export class FormulaDetailsPageModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { FormulaDetailsPage } from "./formula-details.page";
import { FormulaService } from "src/app/core/services/formula.service";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { FormatNumberService } from "src/app/core/services/format-number.service";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

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
    ComponentsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [FormulaDetailsPage],
  providers: [FormulaService, FormatNumberService],
})
export class FormulaDetailsPageModule {}

import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FormulaDetailsPage } from "./formula-details.page";

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
  providers: [DatePipe],
  declarations: [FormulaDetailsPage],
})
export class FormulaDetailsPageModule {}

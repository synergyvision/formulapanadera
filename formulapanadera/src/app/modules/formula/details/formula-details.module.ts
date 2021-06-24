import { NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { FormulaDetailsPage } from "./formula-details.page";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

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
    DirectivesModule
  ],
  providers: [DatePipe],
  declarations: [FormulaDetailsPage],
})
export class FormulaDetailsPageModule {}

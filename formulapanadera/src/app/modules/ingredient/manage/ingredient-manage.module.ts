import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";

import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { ComponentsModule } from "src/app/shared/components/components.module";
import { IngredientManagePage } from "./ingredient-manage.page";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

const routes: Routes = [
  {
    path: "",
    component: IngredientManagePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    TranslateModule,
    ComponentsModule,
    DirectivesModule
  ],
  declarations: [IngredientManagePage],
})
export class IngredientManagePageModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { FormulaService } from "src/app/core/services/formula.service";
import { TranslateModule } from "@ngx-translate/core";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./manage/formula-manage.module").then(
        (m) => m.FormulaManagePageModule
      ),
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
  ],
})
export class FormulaManagementModule {}

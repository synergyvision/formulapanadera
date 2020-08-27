import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { FormulaPage } from "./formula.page";

const routes: Routes = [
  {
    path: "",
    component: FormulaPage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormulaPageRoutingModule {}

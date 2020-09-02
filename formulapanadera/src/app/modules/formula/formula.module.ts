import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./listing/formula-listing.module").then(
        (m) => m.FormulaListingPageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
})
export class FormulaPageModule {}

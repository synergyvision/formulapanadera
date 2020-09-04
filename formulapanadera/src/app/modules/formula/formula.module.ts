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
  {
    path: "manage",
    loadChildren: () =>
      import("./management/formula-management.module").then(
        (m) => m.FormulaManagementModule
      ),
  },
  {
    path: "details",
    loadChildren: () =>
      import("./details/formula-details.module").then(
        (m) => m.FormulaDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
})
export class FormulaPageModule {}

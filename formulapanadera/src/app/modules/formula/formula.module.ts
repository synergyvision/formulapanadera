import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { StateHasDataGuard } from "src/app/core/guards/store-has-data.guard";

const routes: Routes = [
  {
    path: APP_URL.menu.routes.formula.routes.listing,
    loadChildren: () =>
      import("./listing/formula-listing.module").then(
        (m) => m.FormulaListingPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.formula.routes.management,
    loadChildren: () =>
      import("./manage/formula-manage.module").then(
        (m) => m.FormulaManagePageModule
      ),
  },
  {
    path: APP_URL.menu.routes.formula.routes.details,
    canActivate: [StateHasDataGuard],
    loadChildren: () =>
      import("./details/formula-details.module").then(
        (m) => m.FormulaDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
  providers: [StateHasDataGuard],
})
export class FormulaModule {}

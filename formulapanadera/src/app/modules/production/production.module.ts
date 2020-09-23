import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";
import { StateHasDataGuard } from "src/app/core/guards/store-has-data.guard";

const routes: Routes = [
  {
    path: APP_URL.menu.routes.production.routes.listing,
    loadChildren: () =>
      import("./listing/production-listing.module").then(
        (m) => m.ProductionListingPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.production.routes.management,
    loadChildren: () =>
      import("./manage/production-manage.module").then(
        (m) => m.ProductionManagePageModule
      ),
  },
  {
    path: APP_URL.menu.routes.production.routes.details,
    canLoad: [StateHasDataGuard],
    loadChildren: () =>
      import("./details/production-details.module").then(
        (m) => m.ProductionDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
  providers: [StateHasDataGuard],
})
export class ProductionModule {}

import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";

const routes: Routes = [
  {
    path: APP_URL.menu.routes.settings.routes.user_groups.routes.listing,
    loadChildren: () =>
      import("./listing/user-groups-listing.module").then(
        (m) => m.UserGroupsListingModule
      ),
  },
  {
    path: APP_URL.menu.routes.settings.routes.user_groups.routes.management,
    loadChildren: () =>
      import("./manage/user-groups-manage.module").then(
        (m) => m.UserGroupsManageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
})
export class UserGroupsModule {}

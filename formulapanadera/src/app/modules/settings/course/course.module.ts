import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { APP_URL } from "src/app/config/configuration";

const routes: Routes = [
  {
    path: APP_URL.menu.routes.settings.routes.course.routes.listing,
    loadChildren: () =>
      import("./listing/course-listing.module").then(
        (m) => m.CourseListingPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.settings.routes.course.routes.details,
    loadChildren: () =>
      import("./details/course-details.module").then(
        (m) => m.CourseDetailsPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.settings.routes.course.routes.management,
    loadChildren: () =>
      import("./manage/course-manage.module").then(
        (m) => m.CourseManagePageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
})
export class CourseModule {}

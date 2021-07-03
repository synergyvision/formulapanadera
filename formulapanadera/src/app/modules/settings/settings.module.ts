import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ComponentsModule } from "../../shared/components/components.module";
import { APP_URL } from "src/app/config/configuration";
import { AuthorizationGuard } from "src/app/core/guards/authorization.guard";

const routes: Routes = [
  {
    path: APP_URL.menu.routes.settings.routes.settings,
    loadChildren: () =>
      import("./options/options.module").then((m) => m.OptionsPageModule),
  },
  {
    path: APP_URL.menu.routes.settings.routes.change_password,
    loadChildren: () =>
      import("./change-password/change-password.module").then(
        (m) => m.ChangePasswordPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.settings.routes.user_groups.main,
    loadChildren: () =>
      import("./user-groups/user-groups.module").then(
        (m) => m.UserGroupsModule
      ),
    canActivate: [AuthorizationGuard],
    data: {
      permission: 'USER_GROUP'
    }
  },
  {
    path: APP_URL.menu.routes.settings.routes.shared.main,
    loadChildren: () =>
      import("./shared/shared.module").then(
        (m) => m.SharedModule
      ),
    canActivate: [AuthorizationGuard],
    data: {
      permission: 'SHARE'
    }
  },
  {
    path: APP_URL.menu.routes.settings.routes.course.main,
    loadChildren: () =>
      import("./course/course.module").then(
        (m) => m.CourseModule
      ),
    canActivate: [AuthorizationGuard],
    data: {
      permission: 'COURSE'
    }
  },
  {
    path: APP_URL.menu.routes.settings.routes.how_to_use,
    loadChildren: () => import('./how-to-use/how-to-use.module').then( m => m.HowToUsePageModule)
  },
  {
    path: APP_URL.menu.routes.settings.routes.tutorials,
    loadChildren: () => import('./tutorials/tutorials.module').then( m => m.TutorialsPageModule)
  },
  {
    path: APP_URL.menu.routes.settings.routes.contact,
    loadChildren: () => import('./contact/contact.module').then( m => m.ContactPageModule)
  },
  {
    path: APP_URL.menu.routes.settings.routes.social_media,
    loadChildren: () => import('./social-media/social-media.module').then( m => m.SocialMediaPageModule)
  },
  {
    path: APP_URL.menu.routes.settings.routes.faq,
    loadChildren: () => import('./faq/faq.module').then( m => m.FaqPageModule)
  }
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
  providers: [AuthorizationGuard],
})
export class SettingsModule {}

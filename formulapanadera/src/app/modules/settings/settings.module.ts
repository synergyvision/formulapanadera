import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ComponentsModule } from "../../shared/components/components.module";
import { APP_URL } from "src/app/config/configuration";

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
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
})
export class SettingsPageModule {}

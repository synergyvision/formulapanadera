import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { ComponentsModule } from "../../shared/components/components.module";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./options/options.module").then((m) => m.OptionsPageModule),
  },
  {
    path: "change-password",
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

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { APP_URL } from "src/app/config/configuration";

const routes: Routes = [
  {
    path: APP_URL.auth.routes.sign_up,
    loadChildren: () =>
      import("./sign-up/sign-up.module").then((m) => m.SignUpPageModule),
  },
  {
    path: APP_URL.auth.routes.sign_in,
    loadChildren: () =>
      import("./sign-in/sign-in.module").then((m) => m.SignInPageModule),
  },
  {
    path: APP_URL.auth.routes.forgot_password,
    loadChildren: () =>
      import("./forgot-password/forgot-password.module").then(
        (m) => m.ForgotPasswordPageModule
      ),
  },
];

@NgModule({
  imports: [CommonModule, IonicModule, RouterModule.forChild(routes)],
})
export class AuthModule {}

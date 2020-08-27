import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./utils/guards/auth.guard";
import { AuthModule } from "./auth/auth.module";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/auth/sign-in",
    pathMatch: "full",
  },
  {
    path: "menu",
    canLoad: [AuthGuard],
    loadChildren: () =>
      import("./tabs/tabs.module").then((m) => m.TabsPageModule),
  },
  {
    path: "auth",
    loadChildren: () => import("./auth/auth.module").then((m) => m.AuthModule),
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    AuthModule,
  ],
  exports: [RouterModule],
  providers: [AuthGuard],
})
export class AppRoutingModule {}

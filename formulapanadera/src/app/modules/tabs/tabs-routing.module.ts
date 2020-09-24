import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { APP_URL, MAIN_PAGE } from "src/app/config/configuration";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: APP_URL.menu.routes.production.main,
        loadChildren: () =>
          import("../production/production.module").then(
            (m) => m.ProductionModule
          ),
      },
      {
        path: APP_URL.menu.routes.formula.main,
        loadChildren: () =>
          import("../formula/formula.module").then((m) => m.FormulaModule),
      },
      {
        path: APP_URL.menu.routes.ingredient.main,
        loadChildren: () =>
          import("../ingredient/ingredient.module").then(
            (m) => m.IngredientModule
          ),
      },
      {
        path: APP_URL.menu.routes.settings.main,
        loadChildren: () =>
          import("../settings/settings.module").then((m) => m.SettingsModule),
      },
      {
        path: "",
        redirectTo: MAIN_PAGE,
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    redirectTo: MAIN_PAGE,
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

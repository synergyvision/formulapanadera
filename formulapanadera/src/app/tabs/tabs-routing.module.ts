import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { TabsPage } from "./tabs.page";

const routes: Routes = [
  {
    path: "",
    component: TabsPage,
    children: [
      {
        path: "production",
        loadChildren: () =>
          import("../production/production.module").then(
            (m) => m.ProductionPageModule
          ),
      },
      {
        path: "recipe",
        loadChildren: () =>
          import("../recipe/recipe.module").then((m) => m.RecipePageModule),
      },
      {
        path: "ingredient",
        loadChildren: () =>
          import("../ingredient/ingredient.module").then(
            (m) => m.IngredientPageModule
          ),
      },
      {
        path: "settings",
        loadChildren: () =>
          import("../settings/settings.module").then(
            (m) => m.SettingsPageModule
          ),
      },
      {
        path: "",
        redirectTo: "/production",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    redirectTo: "/production",
    pathMatch: "full",
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}

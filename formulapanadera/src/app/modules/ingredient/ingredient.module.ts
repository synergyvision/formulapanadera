import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./listing/ingredient-listing.module").then(
        (m) => m.IngredientListingPageModule
      ),
  },
  {
    path: "manage",
    loadChildren: () =>
      import("./manage/ingredient-manage.module").then(
        (m) => m.IngredientManagePageModule
      ),
  },
  {
    path: "details",
    loadChildren: () =>
      import("./details/ingredient-details.module").then(
        (m) => m.IngredientDetailsPageModule
      ),
  },
];

@NgModule({
  imports: [IonicModule, CommonModule, RouterModule.forChild(routes)],
})
export class IngredientPageModule {}

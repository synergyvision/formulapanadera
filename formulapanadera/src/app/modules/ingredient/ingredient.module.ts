import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { APP_URL } from 'src/app/config/configuration';

const routes: Routes = [
  {
    path: APP_URL.menu.routes.ingredient.routes.listing,
    loadChildren: () =>
      import("./listing/ingredient-listing.module").then(
        (m) => m.IngredientListingPageModule
      ),
  },
  {
    path: APP_URL.menu.routes.ingredient.routes.management,
    loadChildren: () =>
      import("./manage/ingredient-manage.module").then(
        (m) => m.IngredientManagePageModule
      ),
  },
  {
    path: APP_URL.menu.routes.ingredient.routes.details,
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

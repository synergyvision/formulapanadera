import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./listing/ingredient-listing.module").then(
        (m) => m.IngredientListingPageModule
      ),
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
  ],
})
export class IngredientPageModule {}

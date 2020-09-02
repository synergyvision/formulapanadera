import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Routes, RouterModule } from "@angular/router";
import { FormulaListingPage } from "./formula-listing.page";

const routes: Routes = [
  {
    path: "",
    component: FormulaListingPage,
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    TranslateModule,
  ],
  declarations: [FormulaListingPage],
})
export class FormulaListingPageModule {}

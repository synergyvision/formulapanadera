import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { Routes, RouterModule } from "@angular/router";
import { FormulaListingPage } from "./formula-listing.page";
import { FormulaService } from "src/app/core/services/formula.service";
import { FormulaListingResolver } from "src/app/core/resolvers/formula-listing.resolver";
import { AuthService } from "src/app/core/services/auth.service";
import { ComponentsModule } from "src/app/shared/components/components.module";

const routes: Routes = [
  {
    path: "",
    component: FormulaListingPage,
    resolve: {
      data: FormulaListingResolver,
    },
  },
];

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule,
  ],
  declarations: [FormulaListingPage],
  providers: [AuthService, FormulaService, FormulaListingResolver],
})
export class FormulaListingPageModule {}

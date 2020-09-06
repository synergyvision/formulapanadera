import { IonicModule } from "@ionic/angular";
import { RouterModule } from "@angular/router";
import { NgModule, Optional, SkipSelf } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ModuleLoadedOnceGuard } from "./guards/module-loaded-once.guard";

import { environment } from "src/environments/environment";
import { AngularFireModule } from "@angular/fire";
import { AngularFireAuthModule } from "@angular/fire/auth";
import { AngularFirestoreModule } from "@angular/fire/firestore";

import { LanguageService } from "./services/language.service";
import { AuthService } from "./services/auth.service";
import { IngredientService } from "./services/ingredient.service";
import { FormatNumberService } from "./services/format-number.service";
import { FormulaService } from "./services/formula.service";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  exports: [RouterModule, FormsModule],
  providers: [
    AuthService,
    FormatNumberService,
    FormulaService,
    IngredientService,
    LanguageService,
  ],
})
export class CoreModule extends ModuleLoadedOnceGuard {
  // Ensure that CoreModule is only loaded into AppModule
  // Looks for the module in the parent injector to see if it's already been loaded (only want it loaded once)
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}

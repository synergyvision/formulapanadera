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
import { FormatNumberService } from "./services/format-number.service";
import { AuthService } from "./services/firebase/auth.service";
import { IngredientService } from "./services/ingredient.service";
import { FormulaService } from "./services/formula.service";
import { IngredientCRUDService } from "./services/firebase/ingredient.service";
import { FormulaCRUDService } from "./services/firebase/formula.service";
import { ProductionCRUDService } from "./services/firebase/production.service";
import { UserStorageService } from "./services/storage/user.service";
import { ProductionService } from "./services/production.service";
import { TimeService } from "./services/time.service";
import { ProductionInProcessStorageService } from "./services/storage/production-in-process.service";
import { ProductionInProcessService } from "./services/production-in-process.service";
import { LanguageStorageService } from './services/storage/language.service';
import { UserCRUDService } from './services/firebase/user.service';
import { UserService } from './services/user.service';
import { TermsService } from "./services/terms.service";
import { HowToService } from "./services/how-to.service";
import { TutorialsService } from "./services/tutorials.service";
import { ContactService } from "./services/contact.service";
import { SearchBarService } from "./services/search-bar.service";
import { FaqService } from "./services/faq.service";
@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule,
    AngularFireModule.initializeApp(environment.connection),
    AngularFireAuthModule,
    AngularFirestoreModule
  ],
  exports: [RouterModule, FormsModule],
  providers: [
    AuthService,
    FormatNumberService,
    TimeService,
    FormulaService,
    FormulaCRUDService,
    IngredientService,
    IngredientCRUDService,
    ProductionService,
    ProductionInProcessService,
    ProductionCRUDService,
    ProductionInProcessStorageService,
    LanguageService,
    LanguageStorageService,
    UserService,
    UserCRUDService,
    UserStorageService,
    TermsService,
    HowToService,
    TutorialsService,
    ContactService,
    SearchBarService,
    FaqService
  ]
})
export class CoreModule extends ModuleLoadedOnceGuard {
  // Ensure that CoreModule is only loaded into AppModule
  // Looks for the module in the parent injector to see if it's already been loaded (only want it loaded once)
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    super(parentModule);
  }
}

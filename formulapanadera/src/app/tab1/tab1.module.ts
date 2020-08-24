import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { LanguageService } from "../language/language.service";
import { Tab1Page } from "./tab1.page";

import { Tab1PageRoutingModule } from "./tab1-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    Tab1PageRoutingModule,
    TranslateModule,
  ],
  declarations: [Tab1Page],
  providers: [LanguageService],
})
export class Tab1PageModule {}

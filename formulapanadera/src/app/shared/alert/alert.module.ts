import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { LanguageAlert } from "./language/language.alert";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, TranslateModule],
  providers: [LanguageAlert],
})
export class AlertModule {}

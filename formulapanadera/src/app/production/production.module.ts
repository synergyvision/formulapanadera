import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { ProductionPage } from "./production.page";

import { ProductionPageRoutingModule } from "./production-routing.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ProductionPageRoutingModule,
    TranslateModule,
  ],
  declarations: [ProductionPage],
})
export class ProductionPageModule {}

import { IonicModule } from "@ionic/angular";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { TabsPageRoutingModule } from "./tabs-routing.module";
import { TranslateModule } from "@ngx-translate/core";

import { TabsPage } from "./tabs.page";
import { ModalModule } from "src/app/shared/modal/modal.module";
import { DirectivesModule } from "src/app/shared/directives/directives.module";

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    TranslateModule,
    ModalModule,
    DirectivesModule
  ],
  declarations: [TabsPage],
})
export class TabsPageModule {}

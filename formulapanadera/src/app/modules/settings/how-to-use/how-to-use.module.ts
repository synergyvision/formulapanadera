import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HowToUsePageRoutingModule } from './how-to-use-routing.module';

import { HowToUsePage } from './how-to-use.page';
import { TranslateModule } from '@ngx-translate/core';
import { ListStepsComponent } from './list-steps/list-steps.component';
import { SectionComponent } from './section/section.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HowToUsePageRoutingModule,
    TranslateModule
  ],
  declarations: [HowToUsePage, ListStepsComponent, SectionComponent],
})
export class HowToUsePageModule {}

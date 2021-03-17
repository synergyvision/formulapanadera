import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FaqPageRoutingModule } from './faq-routing.module';

import { FaqPage } from './faq.page';
import { TranslateModule } from '@ngx-translate/core';
import { AnswerComponent } from './answer/answer.component';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FaqPageRoutingModule,
    TranslateModule,
    MarkdownModule.forChild()
  ],
  declarations: [FaqPage, AnswerComponent]
})
export class FaqPageModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TutorialsPageRoutingModule } from './tutorials-routing.module';

import { TutorialsPage } from './tutorials.page';
import { TranslateModule } from '@ngx-translate/core';
import { ReadTutorialComponent } from './read-tutorial/read-tutorial.component';

import { MarkdownModule } from 'ngx-markdown';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TutorialsPageRoutingModule,
    TranslateModule,
    MarkdownModule.forChild()
  ],
  declarations: [TutorialsPage, ReadTutorialComponent]
})
export class TutorialsPageModule {}

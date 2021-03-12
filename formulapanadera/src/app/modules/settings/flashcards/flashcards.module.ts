import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FlashcardsPageRoutingModule } from './flashcards-routing.module';

import { FlashcardsPage } from './flashcards.page';
import { FlashcardsSetsComponent } from './flashcards-sets/flashcards-sets.component';
import { FlashcardsSetsDetailsComponent } from './flashcards-sets-details/flashcards-sets-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule } from 'ngx-markdown';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FlashcardsPageRoutingModule,
    TranslateModule,
    MarkdownModule.forChild()
  ],
  declarations: [FlashcardsPage, FlashcardsSetsComponent, FlashcardsSetsDetailsComponent]
})
export class FlashcardsPageModule {}

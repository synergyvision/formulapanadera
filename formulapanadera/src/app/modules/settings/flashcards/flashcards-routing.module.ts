import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FlashcardsSetsComponent } from './flashcards-sets/flashcards-sets.component';

import { FlashcardsPage } from './flashcards.page';

const routes: Routes = [
  {
    path: ':category',
    component: FlashcardsPage
  },
  {
    path: '',
    component: FlashcardsSetsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FlashcardsPageRoutingModule {}

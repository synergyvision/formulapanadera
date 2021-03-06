import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AnswerComponent } from './answer/answer.component';

import { FaqPage } from './faq.page';

const routes: Routes = [
  {
    path: '',
    component: FaqPage
  },
  {
    path: 'answer',
    component: AnswerComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FaqPageRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReadTutorialComponent } from './read-tutorial/read-tutorial.component';

import { TutorialsPage } from './tutorials.page';

const routes: Routes = [
  {
    path: '',
    component: TutorialsPage
  },
  {
    path: 'read',
    component: ReadTutorialComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TutorialsPageRoutingModule {}

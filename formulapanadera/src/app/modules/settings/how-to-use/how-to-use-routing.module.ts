import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HowToUsePage } from './how-to-use.page';
import { SectionComponent } from './section/section.component';

const routes: Routes = [
  {
    path: '',
    component: HowToUsePage
  },
  {
    path: 'section',
    component: SectionComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HowToUsePageRoutingModule {}

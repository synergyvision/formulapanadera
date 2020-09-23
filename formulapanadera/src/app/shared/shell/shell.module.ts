import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { TextShellComponent } from './text-shell/text-shell.component';
import { AppShellConfig } from './config/app-shell.config';

@NgModule({
  declarations: [
    TextShellComponent
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: (appShellConfig: AppShellConfig) => {
        return () => appShellConfig.load();
      },
      deps: [AppShellConfig],
      multi: true
    }
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    IonicModule
  ],
  exports: [
    TextShellComponent
  ]
})
export class ShellModule { }

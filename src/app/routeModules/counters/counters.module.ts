import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { routes } from './counters.routes';
import { CountersComponent } from './counters.component';

@NgModule({
  declarations: [
    CountersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,

    RouterModule.forChild(routes)
  ],
  // exports: [ CountersComponent ]
})
export class CountersModule {
  public static routes = routes;
}

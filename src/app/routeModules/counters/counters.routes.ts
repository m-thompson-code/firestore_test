import { CountersComponent } from './counters.component';

export const routes = [
  { path: '', children: [
    { path: '', component: CountersComponent }
  ]},
];

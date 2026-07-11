import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NabdAi } from './components/nabd-ai/nabd-ai';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'nabd-ai', component: NabdAi }
];

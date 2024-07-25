import { Routes } from '@angular/router';
import { SpellsComponent } from './spells/spells.component';

export const routes: Routes = [
  { path: '', redirectTo: 'spells', pathMatch: 'full' },
  { path: 'spells', component: SpellsComponent },
];

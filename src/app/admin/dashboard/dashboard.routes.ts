import { Route } from '@angular/router';
import { MainComponent } from './main/main.component';
import { Page404Component } from 'app/authentication/page404/page404.component';

export const DASHBOARD_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full',
  },
  {
    path: 'main',
    component: MainComponent,
  },
  { path: '**', component: Page404Component },
];

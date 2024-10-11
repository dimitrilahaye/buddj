import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { MonthCreationComponent } from './components/month-creation/month-creation.component';
import { monthTemplateResolver } from './resolvers/month-template.resolver';
import { OutflowsComponent } from './components/outflows/outflows.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'outflows',
        pathMatch: 'full',
      },
      {
        path: 'outflows',
        component: OutflowsComponent,
      },
    ],
  },
  {
    path: 'month-creation',
    component: MonthCreationComponent,
    canActivate: [authGuard],
    resolve: {
      template: monthTemplateResolver,
    },
  },
];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { authGuard } from './guards/auth.guard';
import { MonthCreationComponent } from './components/month-creation/month-creation.component';
import { monthTemplateResolver } from './resolvers/month-template/month-template.resolver';
import { OutflowsComponent } from './components/outflows/outflows.component';
import { ExpensesComponent } from './components/expenses/expenses.component';
import { ArchivedMonthsComponent } from './components/archived-months/archived-months.component';
import { archivedMonthsResolver } from './resolvers/archived-months/archived-months.resolver';

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
        redirectTo: 'expenses',
        pathMatch: 'full',
      },
      {
        path: 'outflows',
        component: OutflowsComponent,
      },
      {
        path: 'expenses',
        component: ExpensesComponent,
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
  {
    path: 'archived-months',
    component: ArchivedMonthsComponent,
    canActivate: [authGuard],
    resolve: {
      archivedMonths: archivedMonthsResolver,
    },
  },
];

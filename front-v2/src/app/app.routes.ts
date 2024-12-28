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
import { YearlyOutflowsComponent } from './components/yearly-outflows/yearly-outflows.component';
import { yearlyOutflowsResolver } from './resolvers/yearly-outflows/yearly-outflows.resolver';
import { MonthlyTemplatesComponent } from './components/monthly-templates/monthly-templates.component';
import { monthlyTemplatesResolver } from './resolvers/monthly-templates/monthly-templates.resolver';
import { MonthlyTemplateComponent } from './components/monthly-template/monthly-template.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ProjectsComponent } from './components/refunds/projects.component';
import { projectResolver } from './resolvers/project/project.resolver';

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
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard],
  },
  {
    path: 'archived-months',
    component: ArchivedMonthsComponent,
    canActivate: [authGuard],
    resolve: {
      archivedMonths: archivedMonthsResolver,
    },
  },
  {
    path: 'yearly-outflows',
    component: YearlyOutflowsComponent,
    canActivate: [authGuard],
    resolve: {
      yearlyOutflows: yearlyOutflowsResolver,
    },
  },
  {
    path: 'monthly-templates',
    component: MonthlyTemplatesComponent,
    canActivate: [authGuard],
    resolve: {
      monthlyTemplates: monthlyTemplatesResolver,
    },
  },
  {
    path: 'monthly-templates/:id',
    component: MonthlyTemplateComponent,
    canActivate: [authGuard],
    resolve: {
      monthlyTemplates: monthlyTemplatesResolver,
    },
  },
  {
    path: 'project',
    component: ProjectsComponent,
    canActivate: [authGuard],
    resolve: {
      refunds: projectResolver,
    },
  },
];

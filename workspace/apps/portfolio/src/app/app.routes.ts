import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    redirectTo: 'portfolio',
    pathMatch: 'full',
  },
  {
    path: 'portfolio',
    loadComponent: () =>
      import('@features/portfolio/pages/portfolio/portfolio.component').then(
        (m) => m.PortfolioComponent
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('@features/project/pages/projects/projects.component').then(
        (m) => m.ProjectsComponent
      ),
    children: [
      {
        path: ':id',
        loadComponent: () =>
          import(
            '@features/project/pages/project-detail/project-detail.component'
          ).then((m) => m.ProjectDetailComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/pages/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];

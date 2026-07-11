import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { Role } from '@core';

export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },

      {
        // ADMIN + ENCARGADO + VENDEDOR — área de gestión compartida. Cada
        // página con acceso restringido (usuarios/sucursales/configuración/
        // auditoría/categorías/marcas/kardex/transferencias/servicios/
        // colaboradores/reportes) se restringe aparte en admin.routes.ts
        // vía canActivate por child route.
        path: 'admin',
        canActivate: [AuthGuard],
        data: {
          role: [Role.Admin, Role.Encargado, Role.Vendedor],
        },
        loadChildren: () =>
          import('./admin/admin.routes').then((m) => m.ADMIN_ROUTE),
      },
      {
        // ENCARGADO de sucursal — carpeta física "teacher" heredada del
        // template, se repropone como área del encargado en fases 2+.
        path: 'teacher',
        canActivate: [AuthGuard],
        data: {
          role: Role.Encargado,
        },
        loadChildren: () =>
          import('./teacher/teacher.routes').then((m) => m.TEACHER_ROUTE),
      },
      {
        // VENDEDOR — carpeta física "student" heredada del template, se
        // repropone como área del vendedor (POS) en fases 2+.
        path: 'student',
        canActivate: [AuthGuard],
        data: {
          role: Role.Vendedor,
        },
        loadChildren: () =>
          import('./student/student.routes').then((m) => m.STUDENT_ROUTE),
      },
      {
        path: 'extra-pages',
        loadChildren: () =>
          import('./extra-pages/extra-pages.routes').then(
            (m) => m.EXTRA_PAGES_ROUTE,
          ),
      },
      {
        path: 'multilevel',
        loadChildren: () =>
          import('./multilevel/multilevel.routes').then(
            (m) => m.MULTILEVEL_ROUTE,
          ),
      },
    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  },
  { path: '**', component: Page404Component },
];

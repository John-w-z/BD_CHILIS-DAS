import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login',
        loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
    },
    {
        path: 'salon',
        loadComponent: () => import('./components/salon/salon.component').then((m) => m.SalonComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['MOZO', 'CAJERO', 'ANFITRIONA'] }
    },
    {
        path: 'comandas/:idMesa',
        loadComponent: () => import('./components/comandas/comanda.component').then((m) => m.ComandaComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['MOZO'] }
    },
    {
        path: 'cocina',
        loadComponent: () => import('./components/cocina-kds/cocina-kds.component').then((m) => m.CocinaKdsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['COCINERO'] }
    },
    {
        path: 'caja/:idMesa',
        loadComponent: () => import('./components/caja/caja.component').then((m) => m.CajaComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['CAJERO'] }
    },
    { path: '**', redirectTo: 'login' },
];
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const authGuard = () => {
    const router = inject(Router);

    // Verificamos si existe el usuario o token almacenado en la sesión
    const usuarioSesion = localStorage.getItem('usuario_sesion');
    const token = localStorage.getItem('token');

    if (usuarioSesion || token) {
        return true; // Autenticado
    } else {
        router.navigate(['/login']);
        return false;
    }
};
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const expectedRoles: string[] = route.data['roles'] || [];
    
    // Si authService.getUserRole() lee desde localStorage o DTO
    let userRole = authService.getUserRole();

    // Fallback directo a localStorage si authService retorna null
    if (!userRole) {
        const usuarioSesion = localStorage.getItem('usuario_sesion');
        if (usuarioSesion) {
            const usuario = JSON.parse(usuarioSesion);
            userRole = usuario.rol;
        }
    }

    const rolUpper = userRole ? userRole.toUpperCase() : '';

    // El Administrador pasa siempre, o si el rol coincide con la lista esperada
    if (rolUpper === 'ADMINISTRADOR' || expectedRoles.map(r => r.toUpperCase()).includes(rolUpper)) {
        return true;
    }

    alert(`Acceso denegado: El rol ${rolUpper} no tiene permiso para ingresar a esta pantalla.`);

    // Redirección inteligente al área asignada
    switch (rolUpper) {
        case 'COCINERO': router.navigate(['/cocina']); break;
        case 'CAJERO': router.navigate(['/salon']); break;
        case 'ANFITRIONA': router.navigate(['/lista-espera']); break;
        default: router.navigate(['/salon']); break;
    }

    return false;
};
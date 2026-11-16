import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { AuthResponseDTO } from '../../shared/entities/auth.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  usuario = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) { }

  onLogin(): void {
    if (!this.usuario.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor ingrese su usuario y contraseña.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ usuario: this.usuario, password: this.password }).subscribe({
      next: (res: AuthResponseDTO) => {
        this.loading = false;

        // 1. Guardar la sesión completa para roleGuard
        localStorage.setItem('usuario_sesion', JSON.stringify(res));

        // 2. Guardar explícitamente el token para authGuard
        if (res.token) {
          localStorage.setItem('token', res.token);
        } else {
          // Si el DTO devuelto no trae propiedad token, guardamos una clave de sesión flag
          localStorage.setItem('token', 'session_active');
        }

        // 3. Normalizar el rol para la redirección
        const rol = res.rol ? res.rol.toUpperCase() : '';

        // 4. Redirección inteligente al módulo correspondiente
        switch (rol) {
          case 'COCINERO':
            this.router.navigate(['/cocina']);
            break;
          case 'CAJERO':
            this.router.navigate(['/salon']);
            break;
          case 'MOZO':
          case 'ADMINISTRADOR':
          default:
            this.router.navigate(['/salon']);
            break;
        }
      },
      error: (err: { error?: { message?: string } }) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Credenciales inválidas. Intente nuevamente.';
      }
    });
  }
}
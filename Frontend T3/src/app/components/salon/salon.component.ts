import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Mesa } from './mesa.model';
import { MesaService } from './mesa.service';
import { CajaService, CierreCajaDTO } from '../caja/caja.service';

@Component({
    selector: 'app-salon',
    standalone: true,
    imports: [CommonModule, FormsModule], // Asegúrate de incluir FormsModule si usas ngModel en el modal
    templateUrl: './salon.component.html',
    styleUrls: ['./salon.component.css']
})
export class SalonComponent implements OnInit {
    mesas: Mesa[] = [];
    ubicacionSeleccionada: string = 'TODAS';

    // Control de Permisos por Rol
    rolUsuario: string = '';
    esCajero: boolean = false;
    esMozo: boolean = false;
    esAdmin: boolean = false;

    // --- PROPIEDADES PARA EL MODAL DE CIERRE DE CAJA ---
    mostrarModalCierre: boolean = false;
    montoFinalCierre: number = 0;
    observacionCierre: string = '';
    pinAdminCierre: string = '';
    errorModalCierre: string = '';
    cargandoCierre: boolean = false;

    constructor(
        private readonly mesaService: MesaService,
        private readonly cajaService: CajaService,
        private readonly cdr: ChangeDetectorRef,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.cargarRolUsuario();
        this.cargarMesas();
    }

    private cargarRolUsuario(): void {
        const usuarioSesion = localStorage.getItem('usuario_sesion');
        if (usuarioSesion) {
            const usuario = JSON.parse(usuarioSesion);
            this.rolUsuario = usuario.rol ? usuario.rol.toUpperCase() : '';

            this.esCajero = this.rolUsuario === 'CAJERO';
            this.esMozo = this.rolUsuario === 'MOZO';
            this.esAdmin = this.rolUsuario === 'ADMINISTRADOR';
        }
    }

    cargarMesas(): void {
        this.mesaService.listarMesas().subscribe({
            next: (data) => {
                this.mesas = data;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar las mesas:', err);
            }
        });
    }

    // --- MÉTODOS PARA EL CIERRE DE CAJA DESDE EL SALÓN ---

    abrirModalCierre(): void {
        this.mostrarModalCierre = true;
        this.montoFinalCierre = 0;
        this.observacionCierre = '';
        this.pinAdminCierre = '';
        this.errorModalCierre = '';
    }

    confirmarCierreCaja(): void {
        if (this.montoFinalCierre == null || this.montoFinalCierre < 0) {
            this.errorModalCierre = 'Ingrese un monto final válido (>= 0).';
            return;
        }

        if (!this.pinAdminCierre || !this.pinAdminCierre.trim()) {
            this.errorModalCierre = 'Ingrese el PIN de Administrador.';
            return;
        }

        this.cargandoCierre = true;
        this.errorModalCierre = '';

        const usuarioSesionStr = localStorage.getItem('usuario_sesion');
        const usuario = usuarioSesionStr ? JSON.parse(usuarioSesionStr) : null;
        const idCajero = usuario ? usuario.idUsuario : 4;
        const idAdmin = 1; // ID de administrador por defecto

        const dto: CierreCajaDTO = {
            idUsuarioCajero: idCajero,
            idUsuarioAdmin: idAdmin,
            pinAdmin: this.pinAdminCierre.trim(),
            montoFinal: this.montoFinalCierre,
            observacionCierre: this.observacionCierre || 'Cierre de turno desde salón'
        };

        this.cajaService.cerrarCaja(dto).subscribe({
            next: (res) => {
                this.cargandoCierre = false;
                if (res.exito) {
                    alert(res.mensaje);
                    this.mostrarModalCierre = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                this.cargandoCierre = false;
                this.errorModalCierre = err.error?.mensaje || 'Error al procesar el cierre de caja.';
                this.cdr.detectChanges();
            }
        });
    }

    // Cambio manual de estado bloqueado para CAJERO
    cambiarEstado(mesa: Mesa, nuevoEstado: 'LIBRE' | 'OCUPADA' | 'POR_COBRAR'): void {
        if (!mesa.idMesa) return;

        if (this.esCajero) {
            alert('Acceso restringido: El Cajero no puede cambiar manualmente el estado de la mesa.');
            return;
        }

        this.mesaService.actualizarEstado(mesa.idMesa, nuevoEstado).subscribe({
            next: (mesaActualizada) => {
                this.mesas = this.mesas.map(m =>
                    m.idMesa === mesaActualizada.idMesa ? mesaActualizada : m
                );
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al actualizar el estado de la mesa:', err);
            }
        });
    }

    filtrarPorUbicacion(ubicacion: string): void {
        this.ubicacionSeleccionada = ubicacion;
    }

    // Abre la pantalla de tomar pedido para la comanda (Restringido para CAJERO)
    abrirComanda(mesa: Mesa): void {
        if (this.esCajero) {
            alert('El perfil de Cajero no realiza la toma de comandas.');
            return;
        }
        if (mesa.idMesa) {
            this.router.navigate(['/comandas', mesa.idMesa]);
        }
    }

    // Redirección al módulo de caja
    irACaja(mesa: Mesa): void {
        if (!mesa || !mesa.idMesa) return;

        if (mesa.estado === 'LIBRE') {
            alert(`La Mesa #${mesa.numeroMesa} está LIBRE y no tiene productos registrados.`);
            return;
        }

        this.cajaService.obtenerCuentaPorMesa(mesa.idMesa).subscribe({
            next: (comanda) => {
                if (comanda && comanda.detalles && comanda.detalles.length > 0) {
                    this.router.navigate(['/caja', mesa.idMesa]);
                } else {
                    alert(`La Mesa #${mesa.numeroMesa} está ocupada pero aún no tiene ningún pedido grabado.`);
                }
            },
            error: () => {
                alert(`La Mesa #${mesa.numeroMesa} no tiene comandas activas pendientes.`);
            }
        });
    }

    get mesasFiltradas(): Mesa[] {
        if (this.ubicacionSeleccionada === 'TODAS') {
            return this.mesas;
        }
        return this.mesas.filter(m => m.ubicacion === this.ubicacionSeleccionada);
    }
}
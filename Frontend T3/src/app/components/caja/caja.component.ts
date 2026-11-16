import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CajaService, ComprobanteVentaDTO, AperturaCajaDTO, CierreCajaDTO } from './caja.service';
import { Comanda } from '../comandas/comanda.model';

@Component({
    selector: 'app-caja',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './caja.component.html',
    styleUrls: ['./caja.component.css']
})
export class CajaComponent implements OnInit {
    idMesa: number | null = null;
    comandaActiva: Comanda | null = null;
    cargando: boolean = true;
    errorMensaje: string = '';

    // --- PROPIEDADES DE APERTURA DE CAJA ---
    cajaAbierta: boolean = false;
    mostrarModalApertura: boolean = false;
    montoInicial: number = 0;
    pinAdmin: string = '';
    errorModal: string = '';
    cargandoApertura: boolean = false;

    // --- PROPIEDADES DE CIERRE DE CAJA ---
    mostrarModalCierre: boolean = false;
    montoFinalCierre: number = 0;
    observacionCierre: string = '';
    pinAdminCierre: string = '';
    errorModalCierre: string = '';
    cargandoCierre: boolean = false;

    // --- PROPIEDADES DE FACTURACIÓN Y BOLETA ---
    metodoPago: string = 'EFECTIVO';
    montoRecibido: number = 0;
    documentoCliente: string = '';
    mostrarBoleta: boolean = false;
    boletaGenerada: any = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly cajaService: CajaService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        // 1. Verificar primero si la caja está abierta antes de cargar cuentas de mesas
        this.verificarEstadoCaja();
    }

    verificarEstadoCaja(): void {
        this.cajaService.obtenerEstadoCaja().subscribe({
            next: (res) => {
                this.cajaAbierta = res.abierta;
                this.mostrarModalApertura = !this.cajaAbierta;

                if (this.cajaAbierta) {
                    this.inicializarCargaMesa();
                } else {
                    this.cargando = false;
                    this.cdr.detectChanges();
                }
            },
            error: (err) => {
                console.error('Error al consultar estado de caja:', err);
                this.cajaAbierta = false;
                this.mostrarModalApertura = true;
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    confirmarApertura(): void {
        if (this.montoInicial == null || this.montoInicial < 0) {
            this.errorModal = 'El monto inicial debe ser mayor o igual a S/ 0.00';
            return;
        }

        if (!this.pinAdmin || !this.pinAdmin.trim()) {
            this.errorModal = 'Ingrese el PIN del Administrador';
            return;
        }

        this.cargandoApertura = true;
        this.errorModal = '';

        const usuarioSesionStr = localStorage.getItem('usuario_sesion');
        const idCajero = usuarioSesionStr ? JSON.parse(usuarioSesionStr).idUsuario : 4; // Fallback cajero1
        const idAdmin = 1; // ID Admin por defecto

        const dto: AperturaCajaDTO = {
            idUsuarioCajero: idCajero,
            idUsuarioAdmin: idAdmin,
            pinAdmin: this.pinAdmin.trim(),
            montoInicial: this.montoInicial
        };

        this.cajaService.aperturarCaja(dto).subscribe({
            next: (res) => {
                this.cargandoApertura = false;
                if (res.exito) {
                    alert(res.mensaje);
                    this.cajaAbierta = true;
                    this.mostrarModalApertura = false;
                    this.pinAdmin = '';
                    this.cargando = true;
                    this.inicializarCargaMesa();
                }
            },
            error: (err) => {
                this.cargandoApertura = false;
                this.errorModal = err.error?.mensaje || 'Error al validar el PIN o registrar la apertura.';
                this.cdr.detectChanges();
            }
        });
    }

    // --- MÉTODOS PARA EL CIERRE DE CAJA ---

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
        const idCajero = usuarioSesionStr ? JSON.parse(usuarioSesionStr).idUsuario : 4;
        const idAdmin = 1;

        const dto: CierreCajaDTO = {
            idUsuarioCajero: idCajero,
            idUsuarioAdmin: idAdmin,
            pinAdmin: this.pinAdminCierre.trim(),
            montoFinal: this.montoFinalCierre,
            observacionCierre: this.observacionCierre || 'Cierre de turno normal'
        };

        this.cajaService.cerrarCaja(dto).subscribe({
            next: (res) => {
                this.cargandoCierre = false;
                if (res.exito) {
                    alert(res.mensaje);
                    this.mostrarModalCierre = false;
                    this.cajaAbierta = false;
                    // Forzar mostrar modal de apertura de nuevo
                    this.mostrarModalApertura = true;
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

    inicializarCargaMesa(): void {
        const mesaParam = this.route.snapshot.paramMap.get('idMesa');
        if (mesaParam) {
            this.idMesa = +mesaParam;
            this.cargarCuentaMesa(this.idMesa);
        } else {
            this.errorMensaje = 'No se especificó una mesa válida.';
            this.cargando = false;
            this.cdr.detectChanges();
        }
    }

    cargarCuentaMesa(idMesa: number): void {
        this.cajaService.obtenerCuentaPorMesa(idMesa).subscribe({
            next: (data: Comanda) => {
                if (!data || !data.detalles || data.detalles.length === 0) {
                    this.errorMensaje = `La Mesa #${idMesa} no tiene consumos registrados ni comandas pendientes por cobrar.`;
                    this.comandaActiva = null;
                } else {
                    this.comandaActiva = data;
                    this.montoRecibido = this.calcularTotal();
                    this.errorMensaje = '';
                }
                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error al cargar la cuenta de la mesa:', err);
                this.errorMensaje = `La Mesa #${idMesa} no tiene comanda activa en la base de datos.`;
                this.comandaActiva = null;
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    calcularTotal(): number {
        if (!this.comandaActiva) return 0;
        if (this.comandaActiva.totalComanda != null) {
            return Number(this.comandaActiva.totalComanda);
        }
        if (!this.comandaActiva.detalles) return 0;

        return this.comandaActiva.detalles.reduce((acc: number, detalle: any) => {
            const precio = detalle.precioUnitario || 0;
            const subtotal = detalle.subtotal != null
                ? Number(detalle.subtotal)
                : (detalle.cantidad * precio);
            return acc + subtotal;
        }, 0);
    }

    seleccionarMetodoPago(metodo: string): void {
        this.metodoPago = metodo;
        if (metodo === 'EFECTIVO') {
            this.montoRecibido = this.calcularTotal();
        } else {
            this.montoRecibido = 0;
        }
    }

    get vuelto(): number {
        if (this.metodoPago !== 'EFECTIVO') return 0;
        const diff = this.montoRecibido - this.calcularTotal();
        return diff > 0 ? diff : 0;
    }

    confirmarPago(): void {
        if (!this.comandaActiva || !this.idMesa || !this.comandaActiva.idComanda) return;

        const total = this.calcularTotal();

        if (this.metodoPago === 'EFECTIVO' && this.montoRecibido < total) {
            alert('El monto recibido es menor al total a pagar.');
            return;
        }

        const montoEnvio = this.metodoPago === 'EFECTIVO' ? this.montoRecibido : undefined;

        this.cajaService.cobrarYEmitirBoleta(
            this.comandaActiva.idComanda,
            this.idMesa,
            this.metodoPago,
            montoEnvio,
            this.documentoCliente
        ).subscribe({
            next: (boletaDTO: ComprobanteVentaDTO) => {
                this.boletaGenerada = {
                    numeroBoleta: boletaDTO.numeroBoleta,
                    fecha: boletaDTO.fechaEmision ? new Date(boletaDTO.fechaEmision) : new Date(),
                    mesa: boletaDTO.idMesa || this.idMesa,
                    metodoPago: boletaDTO.metodoPago,
                    detalles: this.comandaActiva?.detalles,
                    subtotal: boletaDTO.subtotal,
                    igv: boletaDTO.igv,
                    total: boletaDTO.total,
                    montoRecibido: boletaDTO.montoRecibido,
                    vuelto: boletaDTO.vuelto,
                    documentoCliente: boletaDTO.documentoCliente
                };
                this.mostrarBoleta = true;
                this.cdr.detectChanges();
            },
            error: (err: any) => {
                console.error('Error al procesar el pago:', err);
                alert('Ocurrió un error al procesar el pago.');
            }
        });
    }

    cobrarYLiberar(): void {
        this.confirmarPago();
    }

    imprimirBoleta(): void {
        window.print();
    }

    finalizarOperacion(): void {
        this.router.navigate(['/salon']);
    }

    volverSalon(): void {
        this.finalizarOperacion();
    }
}
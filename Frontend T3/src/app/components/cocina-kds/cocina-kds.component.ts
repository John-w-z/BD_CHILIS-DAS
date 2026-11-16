import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { CocinaService } from './cocina.service';
import { Comanda } from '../comandas/comanda.model';

@Component({
    selector: 'app-cocina-kds',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cocina-kds.component.html',
    styleUrls: ['./cocina-kds.component.css']
})
export class CocinaKdsComponent implements OnInit, OnDestroy {
    comandasPendientes: Comanda[] = [];
    private pollingSub?: Subscription;

    constructor(
        private readonly cocinaService: CocinaService,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarComandas();

        // 1. Polling automático cada 3 segundos para reflejar nuevas comandas sin recargar con F5
        this.pollingSub = interval(3000).subscribe(() => {
            this.cargarComandasSilencioso();
        });
    }

    ngOnDestroy(): void {
        // Limpiamos la suscripción al salir del componente para evitar fugas de memoria
        if (this.pollingSub) {
            this.pollingSub.unsubscribe();
        }
    }

    cargarComandas(): void {
        this.cocinaService.listarComandasCocina().subscribe({
            next: (data) => {
                this.comandasPendientes = data;
                console.log('Comandas asignadas al KDS:', this.comandasPendientes);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar comandas para cocina:', err);
            }
        });
    }

    // Carga silenciosa para el polling (evita parpadeos molestos en la interfaz)
    cargarComandasSilencioso(): void {
        this.cocinaService.listarComandasCocina().subscribe({
            next: (data) => {
                this.comandasPendientes = data;
                this.cdr.detectChanges();
            }
        });
    }

    // 2. Cálculo del tiempo transcurrido desde la creación de la comanda
    calcularTiempoTranscurrido(fechaCreacion: string | undefined): string {
        if (!fechaCreacion) return '0m 0s';
        const inicio = new Date(fechaCreacion).getTime();
        const ahora = new Date().getTime();
        const diferenciaMs = ahora - inicio;

        const minutos = Math.floor(diferenciaMs / 60000);
        const segundos = Math.floor((diferenciaMs % 60000) / 1000);

        return `${minutos}m ${segundos}s`;
    }

    // 3. Semaforización: Asigna clase según los minutos transcurridos
    // Verde: < 5 min (Óptimo) | Amarillo: 5 - 10 min (Advertencia) | Rojo: > 10 min (Crítico)
    obtenerClaseSemaforo(fechaCreacion: string | undefined): string {
        if (!fechaCreacion) return 'semaforo-verde';
        const inicio = new Date(fechaCreacion).getTime();
        const ahora = new Date().getTime();
        const minutos = (ahora - inicio) / 60000;

        if (minutos > 10) {
            return 'semaforo-rojo';
        } else if (minutos > 5) {
            return 'semaforo-amarillo';
        } else {
            return 'semaforo-verde';
        }
    }

    cambiarEstado(idComanda: number | undefined, nuevoEstado: string): void {
        if (!idComanda) return;

        this.cocinaService.actualizarEstadoComanda(idComanda, nuevoEstado).subscribe({
            next: () => {
                if (nuevoEstado === 'LISTO') {
                    this.comandasPendientes = this.comandasPendientes.filter(c => c.idComanda !== idComanda);
                } else {
                    this.cargarComandas();
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al actualizar el estado de la comanda:', err);
            }
        });
    }
}
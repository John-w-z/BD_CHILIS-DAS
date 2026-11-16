import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ComandaService } from './comanda.service';
import { Comanda, DetalleComanda } from './comanda.model';

export interface ProductoBD {
    idProducto: number;
    nombre: string;
    precio: number;
    idCategoria?: number;
    categoria?: any;
    disponible?: boolean;
}

@Component({
    selector: 'app-comanda',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './comanda.component.html',
    styleUrls: ['./comanda.component.css']
})
export class ComandaComponent implements OnInit, OnDestroy {
    idMesaSeleccionada!: number;
    detallesActuales: DetalleComanda[] = [];

    platillosDisponibles: ProductoBD[] = [];
    comandasPrevias: any[] = [];
    cargandoPrevias: boolean = false;

    // --- LÓGICA DE FILTRADO POR CATEGORÍAS ---
    categoriaSeleccionada: string = 'TODOS';
    categorias: string[] = ['TODOS', 'ENTRADAS', 'PLATOS DE FONDO', 'BEBIDAS', 'POSTRES'];

    // Mapeo por ID de producto (IDs exactos según la BD: 1..4 Platos de fondo, 5..6 Bebidas, 7 Postres)
    private readonly mapaCategoriaPorProductoId: { [key: string]: number[] } = {
        'ENTRADAS': [],
        'PLATOS DE FONDO': [1, 2, 3, 4], // Oldtimer(1), Presidente Burger(2), Baby Back Ribs(3), Chicken Fajitas(4)
        'BEBIDAS': [5, 6],               // Presidente Margarita(5), Limonada Chili's(6)
        'POSTRES': [7]                    // Molten Chocolate Cake(7)
    };

    // Subscripción para el Polling automático
    private pollingSubscription?: Subscription;

    comentariosRapidos: string[] = [
        'Término medio',
        'Sin cebolla',
        'Bien cocido',
        'Poco picante',
        'Sin ají',
        'Extra salsa',
        'Sin hielo',
        'Alergia a mariscos'
    ];

    constructor(
        private readonly route: ActivatedRoute,
        public readonly router: Router,
        private readonly comandaService: ComandaService,
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        const idParam = this.route.snapshot.paramMap.get('idMesa');
        if (idParam) {
            this.idMesaSeleccionada = +idParam;
            this.iniciarPollingComandasPrevias();
        }

        this.cargarProductosDesdeBD();
    }

    ngOnDestroy(): void {
        // Cancelamos el temporizador al salir de la pantalla de comanda
        if (this.pollingSubscription) {
            this.pollingSubscription.unsubscribe();
        }
    }

    cargarProductosDesdeBD(): void {
        this.http.get<any[]>('http://localhost:8080/api/productos').subscribe({
            next: (productos) => {
                this.platillosDisponibles = productos;
                this.cdr.detectChanges();
            },
            error: (err: any) => console.error('Error al cargar productos:', err)
        });
    }

    // Getter con evaluación primaria por ID de producto y fallback a categoría si existiera
    get platillosFiltrados(): ProductoBD[] {
        if (this.categoriaSeleccionada === 'TODOS') {
            return this.platillosDisponibles;
        }

        const catBuscada = this.categoriaSeleccionada.toUpperCase();
        const idsValidos = this.mapaCategoriaPorProductoId[catBuscada] || [];

        return this.platillosDisponibles.filter(p => {
            // 1. Filtrado directo por idProducto
            if (idsValidos.includes(p.idProducto)) {
                return true;
            }

            // 2. Fallback por si la categoría viene asignada en el objeto
            const anyP = p as any;
            const nomCat = String(anyP.categoria?.nombre || anyP.categoria || '').trim().toUpperCase();
            if (nomCat) {
                return nomCat === catBuscada || catBuscada.includes(nomCat) || nomCat.includes(catBuscada);
            }

            return false;
        });
    }

    seleccionarCategoria(cat: string): void {
        this.categoriaSeleccionada = cat;
    }

    // Polling: Consulta inicial inmediata (0 ms) y luego repite cada 3000 ms (3 segundos)
    iniciarPollingComandasPrevias(): void {
        this.pollingSubscription = timer(0, 3000).pipe(
            switchMap(() => this.comandaService.obtenerComandasActivasPorMesa(this.idMesaSeleccionada))
        ).subscribe({
            next: (comandas: any[]) => {
                this.comandasPrevias = comandas;
                this.cdr.detectChanges();
            },
            error: (err: any) => console.error('Error en polling de comandas previas:', err)
        });
    }

    agregarPlatillo(platillo: ProductoBD): void {
        const id = platillo.idProducto;
        const indexNormal = this.detallesActuales.findIndex(
            d => d.idPlatillo === id && (!d.comentarios || d.comentarios.trim() === '')
        );

        if (indexNormal !== -1) {
            this.detallesActuales[indexNormal].cantidad++;
            this.detallesActuales[indexNormal].subtotal = this.detallesActuales[indexNormal].cantidad * this.detallesActuales[indexNormal].precioUnitario;
        } else {
            this.detallesActuales.push({
                idPlatillo: id,
                nombrePlatillo: platillo.nombre,
                cantidad: 1,
                precioUnitario: platillo.precio,
                subtotal: platillo.precio,
                comentarios: ''
            });
        }
    }

    seleccionarComentarioRapido(detalle: DetalleComanda, comentario: string): void {
        if (detalle.cantidad > 1) {
            detalle.cantidad--;
            detalle.subtotal = detalle.cantidad * detalle.precioUnitario;

            this.detallesActuales.push({
                idPlatillo: detalle.idPlatillo,
                nombrePlatillo: detalle.nombrePlatillo,
                cantidad: 1,
                precioUnitario: detalle.precioUnitario,
                subtotal: detalle.precioUnitario,
                comentarios: comentario
            });
        } else {
            if (!detalle.comentarios || detalle.comentarios.trim() === '') {
                detalle.comentarios = comentario;
            } else {
                if (!detalle.comentarios.includes(comentario)) {
                    detalle.comentarios = detalle.comentarios.trim() + ', ' + comentario;
                }
            }
        }
    }

    calcularTotal(): number {
        return this.detallesActuales.reduce((acc, item) => acc + item.subtotal, 0);
    }

    disminuirCantidad(index: number): void {
        if (this.detallesActuales[index].cantidad > 1) {
            this.detallesActuales[index].cantidad--;
            this.detallesActuales[index].subtotal = this.detallesActuales[index].cantidad * this.detallesActuales[index].precioUnitario;
        } else {
            this.detallesActuales.splice(index, 1);
        }
    }

    enviarComanda(): void {
        if (this.detallesActuales.length === 0) return;

        const nuevaComanda: Comanda = {
            idMesa: this.idMesaSeleccionada,
            estadoComanda: 'PENDIENTE',
            detalles: this.detallesActuales
        };

        this.comandaService.crearComanda(nuevaComanda).subscribe({
            next: (response) => {
                console.log('Comanda creada con éxito:', response);
                this.detallesActuales = [];
                this.router.navigate(['/salon']);
            },
            error: (err: any) => {
                console.error('Error al registrar la comanda:', err);
                alert('Ocurrió un error al enviar la comanda a cocina.');
            }
        });
    }
}
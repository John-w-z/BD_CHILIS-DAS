import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comanda } from '../comandas/comanda.model'; // Asegúrate de ajustar la ruta relativa hacia tu comanda.model

@Injectable({
    providedIn: 'root'
})
export class CocinaService {
    // URL base de tu API en Spring Boot (ajusta el puerto o ruta si es necesario)
    private readonly apiUrl = 'http://localhost:8080/api/comandas';

    constructor(private readonly http: HttpClient) { }

    // Obtener todas las comandas para el KDS de cocina
    listarComandasCocina(): Observable<Comanda[]> {
        return this.http.get<Comanda[]>(`${this.apiUrl}/cocina`); // <--- Apuntando al nuevo endpoint
    }

    // Actualizar el estado de la comanda (PENDIENTE -> EN_PREPARACION -> LISTO)
    actualizarEstadoComanda(idComanda: number, nuevoEstado: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${idComanda}/estado`, { estadoComanda: nuevoEstado });
    }
}
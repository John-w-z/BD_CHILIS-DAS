import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comanda } from './comanda.model';

@Injectable({
    providedIn: 'root'
})
export class ComandaService {
    private readonly apiUrl = 'http://localhost:8080/api/comandas';

    constructor(private readonly http: HttpClient) { }

    // Crear una nueva comanda para una mesa
    crearComanda(comanda: Comanda): Observable<Comanda> {
        return this.http.post<Comanda>(this.apiUrl, comanda);
    }

    // Obtener comanda activa por mesa (uso directo)
    obtenerComandaPorMesa(idMesa: number): Observable<Comanda> {
        return this.http.get<Comanda>(`${this.apiUrl}/mesa/${idMesa}`);
    }

    // Obtener todas las comandas activas enviadas a cocina para esta mesa (utilizado en el Polling de comanda.component.ts)
    obtenerComandasActivasPorMesa(idMesa: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/mesa/${idMesa}/activas`);
    }
}
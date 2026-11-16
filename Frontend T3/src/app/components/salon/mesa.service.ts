import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Mesa } from './mesa.model';

@Injectable({
    providedIn: 'root'
})
export class MesaService {
    private apiUrl = 'http://localhost:8080/api/mesas';

    constructor(private http: HttpClient) { }

    listarMesas(): Observable<Mesa[]> {
        return this.http.get<Mesa[]>(this.apiUrl);
    }

    actualizarEstado(id: number, estado: string): Observable<Mesa> {
        return this.http.put<Mesa>(`${this.apiUrl}/${id}/estado`, { estado });
    }
}
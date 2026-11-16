import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comanda } from '../comandas/comanda.model';

export interface ComprobanteVentaDTO {
    numeroBoleta: string;
    idMesa: number;
    metodoPago: string;
    subtotal: number;
    igv: number;
    total: number;
    montoRecibido: number;
    vuelto: number;
    fechaEmision: string;
    documentoCliente?: string;
}

export interface AperturaCajaDTO {
    idUsuarioCajero: number;
    idUsuarioAdmin: number;
    pinAdmin: string;
    montoInicial: number;
}

export interface CierreCajaDTO {
    idUsuarioCajero: number;
    idUsuarioAdmin: number;
    pinAdmin: string;
    montoFinal: number;
    observacionCierre: string;
}

@Injectable({
    providedIn: 'root'
})
export class CajaService {
    private readonly apiUrl = 'http://localhost:8080/api/caja';

    constructor(private readonly http: HttpClient) { }

    // --- MÉTODOS PARA APERTURA, CIERRE Y ESTADO DE CAJA ---

    obtenerEstadoCaja(): Observable<{ abierta: boolean }> {
        return this.http.get<{ abierta: boolean }>(`${this.apiUrl}/estado`);
    }

    aperturarCaja(datos: AperturaCajaDTO): Observable<{ exito: boolean; mensaje: string }> {
        return this.http.post<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/aperturar`, datos);
    }

    cerrarCaja(datos: CierreCajaDTO): Observable<{ exito: boolean; mensaje: string }> {
        return this.http.post<{ exito: boolean; mensaje: string }>(`${this.apiUrl}/cerrar`, datos);
    }

    // --- MÉTODOS EXISTENTES DE COBRO Y CUENTAS ---

    // Obtener la cuenta activa y detalles consolidados de una mesa
    obtenerCuentaPorMesa(idMesa: number): Observable<Comanda> {
        return this.http.get<Comanda>(`${this.apiUrl}/mesa/${idMesa}`);
    }

    // Procesar el pago simple (compatibilidad legacy)
    procesarPago(idComanda: number, idMesa: number): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/pagar/${idComanda}/mesa/${idMesa}`, {});
    }

    // --- Cobrar, emitir Boleta de Venta y actualizar estado en BD desde Spring Boot ---
    cobrarYEmitirBoleta(
        idComanda: number,
        idMesa: number,
        metodoPago: string,
        montoRecibido?: number,
        documentoCliente?: string
    ): Observable<ComprobanteVentaDTO> {
        const body = {
            metodoPago: metodoPago,
            montoRecibido: montoRecibido !== undefined && montoRecibido !== null ? montoRecibido : null,
            documentoCliente: documentoCliente && documentoCliente.trim() !== '' ? documentoCliente.trim() : null
        };

        return this.http.post<ComprobanteVentaDTO>(
            `${this.apiUrl}/cobrar/${idComanda}/${idMesa}`,
            body
        );
    }
}
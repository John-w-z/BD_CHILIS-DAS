export interface DetalleComanda {
    idDetalle?: number;
    idPlatillo: number;
    nombrePlatillo?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
    comentarios?: string;
}

export interface Comanda {
    idComanda?: number;
    idMesa: number;
    estadoComanda: 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO' | 'PAGADO' | 'CANCELADO';
    totalComanda?: number;
    detalles: DetalleComanda[];
    fechaCreacion?: string;
}
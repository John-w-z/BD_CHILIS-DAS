export interface Mesa {
    idMesa?: number;
    numeroMesa: number;
    capacidad: number;
    ubicacion: 'SALON' | 'TERRAZA' | 'BARRA';
    estado: 'LIBRE' | 'OCUPADA' | 'POR_COBRAR';
}
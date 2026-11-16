export interface LoginRequestDTO {
    usuario: string;
    password: string;
}

export interface AuthResponseDTO {
    token: string;
    idUsuario: number;
    usuario: string;
    nombreCompleto: string;
    rol: string;
}

export interface ValidarPinDTO {
    idUsuarioAdmin: number;
    pin: string;
}
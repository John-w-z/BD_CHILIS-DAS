package com.chilis.dto;

public record AuthResponseDTO(
        String token,
        Long idUsuario,
        String usuario,
        String nombreCompleto,
        String rol) {
}
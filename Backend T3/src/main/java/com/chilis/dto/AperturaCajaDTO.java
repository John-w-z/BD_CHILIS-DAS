package com.chilis.dto;

import java.math.BigDecimal;

public record AperturaCajaDTO(
        Long idUsuarioCajero,
        Long idUsuarioAdmin,
        String pinAdmin,
        BigDecimal montoInicial) {
}
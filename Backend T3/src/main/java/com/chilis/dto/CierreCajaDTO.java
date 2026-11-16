package com.chilis.dto;

import java.math.BigDecimal;

public record CierreCajaDTO(
        Long idUsuarioCajero,
        Long idUsuarioAdmin,
        String pinAdmin,
        BigDecimal montoFinal,
        String observacionCierre) {
}
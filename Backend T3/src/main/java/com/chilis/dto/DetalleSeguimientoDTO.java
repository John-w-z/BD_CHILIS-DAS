package com.chilis.dto;

import java.math.BigDecimal;

public class DetalleSeguimientoDTO {
    private String nombrePlatillo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private String comentarios;

    public DetalleSeguimientoDTO(String nombrePlatillo, Integer cantidad, BigDecimal precioUnitario,
            String comentarios) {
        this.nombrePlatillo = nombrePlatillo;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.comentarios = comentarios;
    }

    public String getNombrePlatillo() {
        return nombrePlatillo;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public String getComentarios() {
        return comentarios;
    }
}
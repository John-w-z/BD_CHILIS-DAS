package com.chilis.dto;

import java.math.BigDecimal;

public class DetalleAcumuladoDTO {
    private String nombrePlatillo;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String comentarios;

    public DetalleAcumuladoDTO(String nombrePlatillo, Integer cantidad, BigDecimal precioUnitario, BigDecimal subtotal,
            String comentarios) {
        this.nombrePlatillo = nombrePlatillo;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.subtotal = subtotal;
        this.comentarios = comentarios;
    }

    // Getters y Setters
    public String getNombrePlatillo() {
        return nombrePlatillo;
    }

    public Integer getCantidad() {
        return cantidad;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public String getComentarios() {
        return comentarios;
    }
}
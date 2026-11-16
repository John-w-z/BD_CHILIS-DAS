package com.chilis.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ComprobanteVentaDTO {
    private String numeroBoleta;
    private Long idMesa;
    private String metodoPago;
    private BigDecimal subtotal;
    private BigDecimal igv;
    private BigDecimal total;
    private BigDecimal montoRecibido;
    private BigDecimal vuelto;
    private LocalDateTime fechaEmision;
    private String documentoCliente;

    public ComprobanteVentaDTO() {
    }

    public ComprobanteVentaDTO(String numeroBoleta, Long idMesa, String metodoPago, BigDecimal subtotal,
            BigDecimal igv, BigDecimal total, BigDecimal montoRecibido,
            BigDecimal vuelto, LocalDateTime fechaEmision, String documentoCliente) {
        this.numeroBoleta = numeroBoleta;
        this.idMesa = idMesa;
        this.metodoPago = metodoPago;
        this.subtotal = subtotal;
        this.igv = igv;
        this.total = total;
        this.montoRecibido = montoRecibido;
        this.vuelto = vuelto;
        this.fechaEmision = fechaEmision;
        this.documentoCliente = documentoCliente;
    }

    public String getNumeroBoleta() {
        return numeroBoleta;
    }

    public void setNumeroBoleta(String numeroBoleta) {
        this.numeroBoleta = numeroBoleta;
    }

    public Long getIdMesa() {
        return idMesa;
    }

    public void setIdMesa(Long idMesa) {
        this.idMesa = idMesa;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getIgv() {
        return igv;
    }

    public void setIgv(BigDecimal igv) {
        this.igv = igv;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getMontoRecibido() {
        return montoRecibido;
    }

    public void setMontoRecibido(BigDecimal montoRecibido) {
        this.montoRecibido = montoRecibido;
    }

    public BigDecimal getVuelto() {
        return vuelto;
    }

    public void setVuelto(BigDecimal vuelto) {
        this.vuelto = vuelto;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDateTime fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public String getDocumentoCliente() {
        return documentoCliente;
    }

    public void setDocumentoCliente(String documentoCliente) {
        this.documentoCliente = documentoCliente;
    }
}
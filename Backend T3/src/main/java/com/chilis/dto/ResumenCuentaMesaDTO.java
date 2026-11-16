package com.chilis.dto;

import java.math.BigDecimal;
import java.util.List;

public class ResumenCuentaMesaDTO {
    private Long idMesa;
    private List<DetalleAcumuladoDTO> detalles;
    private BigDecimal totalPagar;

    public ResumenCuentaMesaDTO(Long idMesa, List<DetalleAcumuladoDTO> detalles, BigDecimal totalPagar) {
        this.idMesa = idMesa;
        this.detalles = detalles;
        this.totalPagar = totalPagar;
    }

    // Getters y Setters
    public Long getIdMesa() {
        return idMesa;
    }

    public void setIdMesa(Long idMesa) {
        this.idMesa = idMesa;
    }

    public List<DetalleAcumuladoDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleAcumuladoDTO> detalles) {
        this.detalles = detalles;
    }

    public BigDecimal getTotalPagar() {
        return totalPagar;
    }

    public void setTotalPagar(BigDecimal totalPagar) {
        this.totalPagar = totalPagar;
    }
}
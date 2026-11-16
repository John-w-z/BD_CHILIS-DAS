package com.chilis.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ComandaSeguimientoDTO {
    private Long idComanda;
    private String estadoComanda;
    private LocalDateTime fechaCreacion;
    private List<DetalleSeguimientoDTO> detalles;

    public ComandaSeguimientoDTO(Long idComanda, String estadoComanda, LocalDateTime fechaCreacion,
            List<DetalleSeguimientoDTO> detalles) {
        this.idComanda = idComanda;
        this.estadoComanda = estadoComanda;
        this.fechaCreacion = fechaCreacion;
        this.detalles = detalles;
    }

    public Long getIdComanda() {
        return idComanda;
    }

    public String getEstadoComanda() {
        return estadoComanda;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public List<DetalleSeguimientoDTO> getDetalles() {
        return detalles;
    }
}
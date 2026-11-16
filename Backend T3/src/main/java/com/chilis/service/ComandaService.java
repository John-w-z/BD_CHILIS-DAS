package com.chilis.service;

import com.chilis.dto.ComandaSeguimientoDTO;
import com.chilis.dto.DetalleSeguimientoDTO;
import com.chilis.model.Comanda;
import com.chilis.model.Mesa;
import com.chilis.repository.ComandaRepository;
import com.chilis.repository.MesaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComandaService {

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;

    public ComandaService(ComandaRepository comandaRepository, MesaRepository mesaRepository) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
    }

    @Transactional
    public Comanda guardarComanda(Comanda comanda) {
        // 1. Guardar la comanda en la base de datos
        Comanda nuevaComanda = comandaRepository.save(comanda);

        // 2. Actualizar automáticamente el estado de la mesa a "OCUPADA"
        if (comanda.getIdMesa() != null) {
            Optional<Mesa> mesaOpt = mesaRepository.findById(comanda.getIdMesa());
            if (mesaOpt.isPresent()) {
                Mesa mesa = mesaOpt.get();
                mesa.setEstado("OCUPADA");
                mesaRepository.save(mesa);
            }
        }

        return nuevaComanda;
    }

    public Optional<Comanda> obtenerComandaPorMesa(Long idMesa) {
        return comandaRepository.findByIdMesa(idMesa);
    }

    // --- MÉTODO PARA SEGUIMIENTO DE SEGUNDOS PEDIDOS EN SALÓN (MOZO) ---
    public List<ComandaSeguimientoDTO> obtenerComandasActivasPorMesa(Long idMesa) {
        List<Comanda> comandas = comandaRepository.findComandasActivasByMesa(idMesa);

        return comandas.stream().map(c -> {
            List<DetalleSeguimientoDTO> detallesDTO = c.getDetalles().stream().map(d -> new DetalleSeguimientoDTO(
                    d.getNombrePlatillo(),
                    d.getCantidad(),
                    d.getPrecioUnitario(),
                    d.getComentarios())).collect(Collectors.toList());

            return new ComandaSeguimientoDTO(
                    c.getIdComanda(),
                    c.getEstadoComanda(),
                    c.getFechaCreacion(),
                    detallesDTO);
        }).collect(Collectors.toList());
    }

    // --- MÉTODOS PARA EL MÓDULO DE COCINA (KDS) ---

    public List<Comanda> listarTodas() {
        return comandaRepository.findAll();
    }

    public List<Comanda> listarComandasActivas() {
        return comandaRepository.findComandasActivas();
    }

    public boolean actualizarEstado(Long idComanda, String nuevoEstado) {
        Optional<Comanda> comandaOpt = comandaRepository.findById(idComanda);
        if (comandaOpt.isPresent()) {
            Comanda comanda = comandaOpt.get();
            comanda.setEstadoComanda(nuevoEstado);
            comandaRepository.save(comanda);
            return true;
        }
        return false;
    }
}
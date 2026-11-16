package com.chilis.service;

import com.chilis.dto.CierreCajaDTO;
import com.chilis.dto.CobroRequestDTO;
import com.chilis.dto.ComprobanteVentaDTO;
import com.chilis.model.Comanda;
import com.chilis.model.DetalleComanda;
import com.chilis.model.Mesa;
import com.chilis.model.TurnoCaja;
import com.chilis.model.Usuario;
import com.chilis.repository.ComandaRepository;
import com.chilis.repository.MesaRepository;
import com.chilis.repository.TurnoCajaRepository;
import com.chilis.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class CajaService {

    private final ComandaRepository comandaRepository;
    private final MesaRepository mesaRepository;
    private final TurnoCajaRepository turnoCajaRepository;
    private final UsuarioRepository usuarioRepository;

    public CajaService(ComandaRepository comandaRepository,
            MesaRepository mesaRepository,
            TurnoCajaRepository turnoCajaRepository,
            UsuarioRepository usuarioRepository) {
        this.comandaRepository = comandaRepository;
        this.mesaRepository = mesaRepository;
        this.turnoCajaRepository = turnoCajaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // ============================================================================
    // MÉTODOS PARA GESTIÓN Y APERTURA DE CAJA (TABLA turnos_caja)
    // ============================================================================

    @Transactional(readOnly = true)
    public boolean isCajaAbierta() {
        return turnoCajaRepository.existsByEstado("ABIERTA");
    }

    @Transactional
    public void registrarApertura(Long idUsuarioCajero, BigDecimal montoInicial) {
        if (isCajaAbierta()) {
            throw new RuntimeException("Ya existe una sesión de caja abierta.");
        }

        Usuario cajero = usuarioRepository.findById(idUsuarioCajero)
                .orElseThrow(() -> new RuntimeException("Usuario Cajero no encontrado con ID: " + idUsuarioCajero));

        TurnoCaja turno = new TurnoCaja();
        turno.setUsuario(cajero);
        turno.setMontoInicial(montoInicial != null ? montoInicial : BigDecimal.ZERO);
        turno.setFechaApertura(LocalDateTime.now());
        turno.setEstado("ABIERTA");

        turnoCajaRepository.save(turno);
    }

    @Transactional
    public void registrarCierre(CierreCajaDTO dto) {
        // 1. Buscar el turno de caja que se encuentra abierto actualmente
        TurnoCaja turnoActual = turnoCajaRepository.findFirstByEstadoOrderByIdTurnoDesc("ABIERTA")
                .orElseThrow(() -> new RuntimeException("No existe ninguna sesión de caja abierta para cerrar."));

        BigDecimal montoFinal = dto.montoFinal() != null ? dto.montoFinal() : BigDecimal.ZERO;

        // 2. Calcular diferencia preliminar respecto al monto inicial
        // (Opcional: puedes ajustarlo sumando los pagos en efectivo del día si lo
        // requieres)
        BigDecimal diferencia = montoFinal.subtract(turnoActual.getMontoInicial());

        // 3. Actualizar datos del turno
        turnoActual.setMontoFinal(montoFinal);
        turnoActual.setDiferencia(diferencia);
        turnoActual.setObservacionCierre(dto.observacionCierre());
        turnoActual.setFechaCierre(LocalDateTime.now());
        turnoActual.setEstado("CERRADA");

        turnoCajaRepository.save(turnoActual);
    }

    // ============================================================================
    // MÉTODOS DE COBRO, CUENTAS Y FACTURACIÓN
    // ============================================================================

    public Optional<Comanda> obtenerCuentaPorMesa(Long idMesa) {
        List<Comanda> comandasPendientes = comandaRepository.findComandasActivasByMesa(idMesa);

        if (comandasPendientes.isEmpty()) {
            return Optional.empty();
        }

        Comanda comandaConsolidada = comandasPendientes.get(0);
        Map<Long, DetalleComanda> mapaDetallesAgrupados = new LinkedHashMap<>();
        BigDecimal totalGeneral = BigDecimal.ZERO;

        for (Comanda comanda : comandasPendientes) {
            if (comanda.getDetalles() != null && !comanda.getDetalles().isEmpty()) {
                for (DetalleComanda det : comanda.getDetalles()) {
                    Long idPlatillo = det.getIdPlatillo();

                    if (idPlatillo != null && det.getPrecioUnitario() != null) {
                        BigDecimal subtotalDetalle = det.getSubtotal() != null
                                ? det.getSubtotal()
                                : det.getPrecioUnitario().multiply(new BigDecimal(det.getCantidad()));

                        totalGeneral = totalGeneral.add(subtotalDetalle);

                        if (mapaDetallesAgrupados.containsKey(idPlatillo)) {
                            DetalleComanda existente = mapaDetallesAgrupados.get(idPlatillo);
                            int nuevaCantidad = existente.getCantidad() + det.getCantidad();
                            existente.setCantidad(nuevaCantidad);
                            existente
                                    .setSubtotal(existente.getPrecioUnitario().multiply(new BigDecimal(nuevaCantidad)));
                        } else {
                            DetalleComanda nuevoDetalle = new DetalleComanda();
                            nuevoDetalle.setIdPlatillo(det.getIdPlatillo());
                            nuevoDetalle.setNombrePlatillo(det.getNombrePlatillo());
                            nuevoDetalle.setPrecioUnitario(det.getPrecioUnitario());
                            nuevoDetalle.setCantidad(det.getCantidad());
                            nuevoDetalle.setSubtotal(subtotalDetalle);
                            nuevoDetalle.setComentarios(null);

                            mapaDetallesAgrupados.put(idPlatillo, nuevoDetalle);
                        }
                    }
                }
            }
        }

        if (mapaDetallesAgrupados.isEmpty()) {
            return Optional.empty();
        }

        comandaConsolidada.setDetalles(new ArrayList<>(mapaDetallesAgrupados.values()));
        comandaConsolidada.setTotalComanda(totalGeneral);

        return Optional.of(comandaConsolidada);
    }

    @Transactional
    public boolean procesarPago(Long idComanda, Long idMesa) {
        List<Comanda> comandasPendientes = comandaRepository.findComandasActivasByMesa(idMesa);
        if (!comandasPendientes.isEmpty()) {
            for (Comanda c : comandasPendientes) {
                c.setEstadoComanda("PAGADO");
            }
            comandaRepository.saveAll(comandasPendientes);
        } else {
            Optional<Comanda> comandaOpt = comandaRepository.findById(idComanda);
            if (comandaOpt.isPresent()) {
                Comanda c = comandaOpt.get();
                c.setEstadoComanda("PAGADO");
                comandaRepository.save(c);
            }
        }

        Optional<Mesa> mesaOpt = mesaRepository.findById(idMesa);
        if (mesaOpt.isPresent()) {
            Mesa mesa = mesaOpt.get();
            mesa.setEstado("LIBRE");
            mesaRepository.save(mesa);
            return true;
        }
        return false;
    }

    @Transactional
    public ComprobanteVentaDTO procesarPagoYEmitirBoleta(Long idComanda, Long idMesa, CobroRequestDTO request) {
        String metodo = (request != null && request.getMetodoPago() != null) ? request.getMetodoPago() : "EFECTIVO";
        BigDecimal monto = (request != null) ? request.getMontoRecibido() : null;
        String doc = (request != null) ? request.getDocumentoCliente() : null;

        return procesarPagoYEmitirBoleta(idComanda, idMesa, metodo, monto, doc);
    }

    @Transactional
    public ComprobanteVentaDTO procesarPagoYEmitirBoleta(
            Long idComanda,
            Long idMesa,
            String metodoPago,
            BigDecimal montoRecibido,
            String documentoCliente) {

        List<Comanda> comandasAfectadas = comandaRepository.findComandasActivasByMesa(idMesa);
        BigDecimal totalAcumulado = BigDecimal.ZERO;

        if (!comandasAfectadas.isEmpty()) {
            for (Comanda c : comandasAfectadas) {
                if (c.getDetalles() != null) {
                    for (DetalleComanda d : c.getDetalles()) {
                        if (d.getSubtotal() != null) {
                            totalAcumulado = totalAcumulado.add(d.getSubtotal());
                        } else if (d.getPrecioUnitario() != null) {
                            totalAcumulado = totalAcumulado
                                    .add(d.getPrecioUnitario().multiply(new BigDecimal(d.getCantidad())));
                        }
                    }
                }
            }
        } else {
            Comanda comandaDirecta = comandaRepository.findById(idComanda)
                    .orElseThrow(() -> new RuntimeException("Comanda no encontrada con ID: " + idComanda));
            if (comandaDirecta.getDetalles() != null) {
                for (DetalleComanda d : comandaDirecta.getDetalles()) {
                    if (d.getSubtotal() != null) {
                        totalAcumulado = totalAcumulado.add(d.getSubtotal());
                    } else if (d.getPrecioUnitario() != null) {
                        totalAcumulado = totalAcumulado
                                .add(d.getPrecioUnitario().multiply(new BigDecimal(d.getCantidad())));
                    }
                }
            }
        }

        BigDecimal total = totalAcumulado.setScale(2, RoundingMode.HALF_UP);

        // Desglose IGV (18% Perú)
        BigDecimal baseImponible = total.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
        BigDecimal igv = total.subtract(baseImponible);

        BigDecimal montoEfectivo = (montoRecibido != null && montoRecibido.compareTo(BigDecimal.ZERO) > 0)
                ? montoRecibido
                : total;

        BigDecimal vuelto = ("EFECTIVO".equalsIgnoreCase(metodoPago) && montoEfectivo.compareTo(total) > 0)
                ? montoEfectivo.subtract(total)
                : BigDecimal.ZERO;

        procesarPago(idComanda, idMesa);

        ComprobanteVentaDTO boleta = new ComprobanteVentaDTO();
        boleta.setNumeroBoleta(String.format("B001-%06d", idComanda));
        boleta.setIdMesa(idMesa);
        boleta.setMetodoPago(metodoPago != null ? metodoPago.toUpperCase() : "EFECTIVO");
        boleta.setSubtotal(baseImponible);
        boleta.setIgv(igv);
        boleta.setTotal(total);
        boleta.setMontoRecibido(montoEfectivo);
        boleta.setVuelto(vuelto);
        boleta.setFechaEmision(LocalDateTime.now());
        boleta.setDocumentoCliente(documentoCliente);

        return boleta;
    }
}
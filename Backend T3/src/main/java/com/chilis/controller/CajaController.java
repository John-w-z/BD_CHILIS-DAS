package com.chilis.controller;

import com.chilis.dto.AperturaCajaDTO;
import com.chilis.dto.CierreCajaDTO;
import com.chilis.dto.CobroRequestDTO;
import com.chilis.dto.ComprobanteVentaDTO;
import com.chilis.dto.ValidarPinDTO;
import com.chilis.model.Comanda;
import com.chilis.service.AuthService;
import com.chilis.service.CajaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/caja")
@CrossOrigin(origins = "http://localhost:4200")
public class CajaController {

    private final CajaService cajaService;
    private final AuthService authService; // Inyectamos AuthService para validar el PIN

    public CajaController(CajaService cajaService, AuthService authService) {
        this.cajaService = cajaService;
        this.authService = authService;
    }

    // --- OPERACIONES DE APERTURA, CIERRE Y ESTADO DE CAJA ---

    @GetMapping("/estado")
    public ResponseEntity<?> obtenerEstadoCaja() {
        boolean estaAbierta = cajaService.isCajaAbierta();
        return ResponseEntity.ok(Map.of("abierta", estaAbierta));
    }

    @PostMapping("/aperturar")
    public ResponseEntity<?> aperturarCaja(@RequestBody AperturaCajaDTO dto) {
        try {
            // 1. Validar PIN del Administrador usando AuthService
            boolean pinValido = authService.validarPinAdmin(
                    new ValidarPinDTO(dto.idUsuarioAdmin(), dto.pinAdmin()));

            if (!pinValido) {
                return ResponseEntity.status(401)
                        .body(Map.of("exito", false, "mensaje", "PIN de Administrador incorrecto."));
            }

            // 2. Registrar la apertura en el dominio de caja
            cajaService.registrarApertura(dto.idUsuarioCajero(), dto.montoInicial());

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Caja aperturada exitosamente."));

        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("exito", false, "mensaje", e.getMessage()));
        }
    }

    @PostMapping("/cerrar")
    public ResponseEntity<?> cerrarCaja(@RequestBody CierreCajaDTO dto) {
        try {
            // 1. Validar PIN del Administrador usando AuthService
            boolean pinValido = authService.validarPinAdmin(
                    new ValidarPinDTO(dto.idUsuarioAdmin(), dto.pinAdmin()));

            if (!pinValido) {
                return ResponseEntity.status(401)
                        .body(Map.of("exito", false, "mensaje", "PIN de Administrador incorrecto."));
            }

            // 2. Registrar el cierre y arqueo en la base de datos
            cajaService.registrarCierre(dto);

            return ResponseEntity.ok(Map.of(
                    "exito", true,
                    "mensaje", "Caja cerrada y arqueo registrado correctamente."));

        } catch (Exception e) {
            return ResponseEntity.status(400)
                    .body(Map.of("exito", false, "mensaje", e.getMessage()));
        }
    }

    // --- OPERACIONES DE COBRO Y MESAS ---

    @GetMapping("/mesa/{idMesa}")
    public ResponseEntity<Comanda> obtenerCuentaPorMesa(@PathVariable Long idMesa) {
        Optional<Comanda> comanda = cajaService.obtenerCuentaPorMesa(idMesa);
        return comanda.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/pagar/{idComanda}/mesa/{idMesa}")
    public ResponseEntity<Void> procesarPago(@PathVariable Long idComanda, @PathVariable Long idMesa) {
        boolean pagoExitoso = cajaService.procesarPago(idComanda, idMesa);
        if (pagoExitoso) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @PostMapping("/cobrar/{idComanda}/{idMesa}")
    public ResponseEntity<ComprobanteVentaDTO> cobrarYLiberarMesa(
            @PathVariable Long idComanda,
            @PathVariable Long idMesa,
            @RequestBody CobroRequestDTO request) {

        ComprobanteVentaDTO boleta = cajaService.procesarPagoYEmitirBoleta(idComanda, idMesa, request);
        return ResponseEntity.ok(boleta);
    }
}
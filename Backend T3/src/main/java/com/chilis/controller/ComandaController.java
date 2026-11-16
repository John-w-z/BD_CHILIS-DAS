package com.chilis.controller;

import com.chilis.dto.ComandaSeguimientoDTO;
import com.chilis.model.Comanda;
import com.chilis.service.ComandaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comandas")
@CrossOrigin(origins = "http://localhost:4200")
public class ComandaController {

    private final ComandaService comandaService;

    // Constructor para la inyección de dependencias de Spring
    public ComandaController(ComandaService comandaService) {
        this.comandaService = comandaService;
    }

    // 1. Endpoint para listar todas las comandas (para administración o reportes)
    @GetMapping
    public ResponseEntity<List<Comanda>> listarComandas() {
        List<Comanda> comandas = comandaService.listarTodas();
        return ResponseEntity.ok(comandas);
    }

    // --- ENDPOINT OPTIMIZADO PARA EL KDS DE COCINA ---
    // 1.1. Endpoint exclusivo que devuelve solo las comandas activas (excluye
    // LISTO)
    @GetMapping("/cocina")
    public ResponseEntity<List<Comanda>> listarComandasCocina() {
        List<Comanda> comandasActivas = comandaService.listarComandasActivas();
        return ResponseEntity.ok(comandasActivas);
    }

    // --- NUEVO: ENDPOINT PARA SEGUIMIENTO DE PEDIDOS EN SALÓN (MOZO) ---
    // Devuelve todas las comandas no pagadas de una mesa específica con su estado
    // de preparación
    @GetMapping("/mesa/{idMesa}/activas")
    public ResponseEntity<List<ComandaSeguimientoDTO>> obtenerComandasActivasPorMesa(@PathVariable Long idMesa) {
        List<ComandaSeguimientoDTO> comandas = comandaService.obtenerComandasActivasPorMesa(idMesa);
        return ResponseEntity.ok(comandas);
    }

    // 2. Endpoint para crear una comanda
    @PostMapping
    public ResponseEntity<Comanda> crearComanda(@RequestBody Comanda comanda) {
        Comanda nuevaComanda = comandaService.guardarComanda(comanda);
        return ResponseEntity.ok(nuevaComanda);
    }

    // 3. Endpoint específico para actualizar el estado desde el KDS de Cocina
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> actualizarEstadoComanda(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String nuevoEstado = body.get("estadoComanda");
        boolean actualizado = comandaService.actualizarEstado(id, nuevoEstado);

        if (actualizado) {
            return ResponseEntity.ok(Map.of("mensaje", "Estado actualizado correctamente"));
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
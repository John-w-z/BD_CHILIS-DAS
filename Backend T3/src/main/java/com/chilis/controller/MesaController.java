package com.chilis.controller;

import com.chilis.model.Mesa;
import com.chilis.repository.MesaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mesas")
@CrossOrigin(origins = "http://localhost:4200")
public class MesaController {

    private final MesaRepository mesaRepository;

    public MesaController(MesaRepository mesaRepository) {
        this.mesaRepository = mesaRepository;
    }

    @GetMapping
    public List<Mesa> listarMesas() {
        return mesaRepository.findAll();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Mesa> actualizarEstado(@PathVariable Long id, @RequestBody Mesa mesaDetalles) {
        return mesaRepository.findById(id)
                .map(mesa -> {
                    mesa.setEstado(mesaDetalles.getEstado());
                    Mesa actualizada = mesaRepository.save(mesa);
                    return ResponseEntity.ok(actualizada);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
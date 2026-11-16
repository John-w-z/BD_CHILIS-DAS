package com.chilis.controller;

import com.chilis.dto.*;
import com.chilis.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    // Inyección explícita por constructor manual
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO dto) {
        return ResponseEntity.ok(authService.login(dto));
    }

    @PostMapping("/validar-pin")
    public ResponseEntity<Boolean> validarPin(@RequestBody ValidarPinDTO dto) {
        return ResponseEntity.ok(authService.validarPinAdmin(dto));
    }
}
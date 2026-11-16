package com.chilis;

import com.chilis.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

    // Sincronizador automático de contraseña en el arranque
    @Bean
    public CommandLineRunner inicializarDatos(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String hashValido = passwordEncoder.encode("123456");

            usuarioRepository.findByUsuario("mozo1").ifPresent(usuario -> {
                usuario.setPasswordHash(hashValido);
                usuarioRepository.save(usuario);
            });
        };
    }
}
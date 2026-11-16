package com.chilis.repository;

import com.chilis.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("SELECT u FROM Usuario u JOIN FETCH u.rol LEFT JOIN FETCH u.personal WHERE u.usuario = :usuario")
    Optional<Usuario> findByUsuario(@Param("usuario") String usuario);
}
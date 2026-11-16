package com.chilis.repository;

import com.chilis.model.TurnoCaja;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TurnoCajaRepository extends JpaRepository<TurnoCaja, Long> {

    boolean existsByEstado(String estado);

    Optional<TurnoCaja> findFirstByEstadoOrderByIdTurnoDesc(String estado);
}
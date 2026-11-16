package com.chilis.repository;

import com.chilis.model.Comanda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ComandaRepository extends JpaRepository<Comanda, Long> {

    Optional<Comanda> findByIdMesa(Long idMesa);

    // Retorna TODAS las comandas/cuentas activas no pagadas de una mesa (ordenadas
    // por fecha)
    @Query("SELECT c FROM Comanda c WHERE c.idMesa = :idMesa AND UPPER(c.estadoComanda) NOT IN ('PAGADO', 'PAGADA', 'CANCELADO', 'CANCELADA') ORDER BY c.fechaCreacion ASC")
    List<Comanda> findComandasActivasByMesa(@Param("idMesa") Long idMesa);

    // Consulta explícita para la vista de cocina (KDS)
    @Query("SELECT c FROM Comanda c WHERE UPPER(c.estadoComanda) NOT IN ('LISTO', 'PAGADO', 'PAGADA', 'CANCELADO', 'CANCELADA')")
    List<Comanda> findComandasActivas();
}
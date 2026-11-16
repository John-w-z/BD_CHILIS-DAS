package com.chilis.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUsuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_personal", nullable = false)
    private Personal personal;

    @ManyToOne(fetch = FetchType.EAGER)

    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @Column(nullable = false, unique = true, length = 50)
    private String usuario;

    @Column(name = "password_hash", nullable = false, length = 80)
    private String passwordHash;

    @Column(name = "pin_hash", length = 80)
    private String pinHash;

    @Column(length = 150)
    private String correo;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(name = "intentos_fallidos")
    private Integer intentosFallidos = 0;

    @Column(name = "inicio_bloqueo")
    private LocalDateTime inicioBloqueo;

    public Usuario() {
    }

    public Usuario(Long idUsuario, Personal personal, Rol rol, String usuario, String passwordHash, String pinHash,
            String correo, Boolean activo, Integer intentosFallidos, LocalDateTime inicioBloqueo) {
        this.idUsuario = idUsuario;
        this.personal = personal;
        this.rol = rol;
        this.usuario = usuario;
        this.passwordHash = passwordHash;
        this.pinHash = pinHash;
        this.correo = correo;
        this.activo = activo;
        this.intentosFallidos = intentosFallidos;
        this.inicioBloqueo = inicioBloqueo;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Personal getPersonal() {
        return personal;
    }

    public void setPersonal(Personal personal) {
        this.personal = personal;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPinHash() {
        return pinHash;
    }

    public void setPinHash(String pinHash) {
        this.pinHash = pinHash;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public Boolean getActivo() {
        return activo;
    }

    public void setActivo(Boolean activo) {
        this.activo = activo;
    }

    public Integer getIntentosFallidos() {
        return intentosFallidos;
    }

    public void setIntentosFallidos(Integer intentosFallidos) {
        this.intentosFallidos = intentosFallidos;
    }

    public LocalDateTime getInicioBloqueo() {
        return inicioBloqueo;
    }

    public void setInicioBloqueo(LocalDateTime inicioBloqueo) {
        this.inicioBloqueo = inicioBloqueo;
    }
}
-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS - CHILI'S (CINDEL S.A.)
-- Proyecto: Sistema de Gestión de Pedidos y Atención al Cliente
-- Archivo: chilis_db_init.sql (Fase 1)
-- Motor: MySQL 8.0+ | Engine: InnoDB | Charset: utf8mb4
-- ============================================================================

DROP DATABASE IF EXISTS Siosi;
CREATE DATABASE Siosi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE Siosi;

-- ----------------------------------------------------------------------------
-- 1. TABLAS CORE Y SEGURIDAD (ROLES, PERSONAL, USUARIOS)
-- ----------------------------------------------------------------------------

CREATE TABLE roles (
    id_rol BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE,
    descripcion VARCHAR(200),
    activo BIT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE personal (
    id_personal BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    activo BIT(1) DEFAULT 1,
    fecha_ingreso DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_personal BIGINT NOT NULL,
    id_rol BIGINT NOT NULL,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(80) NOT NULL,
    pin_hash VARCHAR(80),
    correo VARCHAR(150),
    activo BIT(1) DEFAULT 1,
    intentos_fallidos INT DEFAULT 0,
    inicio_bloqueo DATETIME NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuarios_personal FOREIGN KEY (id_personal) REFERENCES personal(id_personal),
    CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. TABLAS DE INFRAESTRUCTURA Y SALÓN (MESAS, CLIENTES, LISTA DE ESPERA)
-- ----------------------------------------------------------------------------

CREATE TABLE mesas (
    id_mesa BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero_mesa INT NOT NULL UNIQUE,
    capacidad INT NOT NULL,
    ubicacion VARCHAR(10) DEFAULT 'SALON',
    activo BIT(1) DEFAULT 1,
    estado VARCHAR(30) DEFAULT 'LIBRE' -- LIBRE, OCUPADA, EN_LIQUIDACION, EN_MANTENIMIENTO
) ENGINE=InnoDB;

CREATE TABLE clientes (
    id_cliente BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    apellidos VARCHAR(150),
    documento_varchar VARCHAR(30),
    telefono VARCHAR(20),
    correo VARCHAR(150),
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE lista_espera (
    id_espera BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre_cliente VARCHAR(150) NOT NULL,
    cantidad_personas INT NOT NULL,
    tiempo_estimado_min INT DEFAULT 15,
    fecha_llegada DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'EN_ESPERA' -- EN_ESPERA, ASIGNADO, CANCELADO
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. TABLAS DE CUENTAS Y COMANDAS (CUENTAS, PEDIDOS, DETALLES)
-- ----------------------------------------------------------------------------

CREATE TABLE cuentas (
    id_cuenta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_mesa BIGINT NOT NULL,
    id_cliente BIGINT NULL,
    id_usuario BIGINT NOT NULL,
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    estado VARCHAR(30) DEFAULT 'ABIERTA', -- ABIERTA, PAGADA, CANCELADA, EN_COBRO_AMARILLO
    total DECIMAL(10,2) DEFAULT 0.00,
    CONSTRAINT fk_cuentas_mesas FOREIGN KEY (id_mesa) REFERENCES mesas(id_mesa),
    CONSTRAINT fk_cuentas_clientes FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente),
    CONSTRAINT fk_cuentas_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE pedidos (
    id_pedido BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL, -- Mozo asignado
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30) DEFAULT 'PENDIENTE', -- PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO, CANCELADO
    observaciones VARCHAR(500),
    CONSTRAINT fk_pedidos_cuentas FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta),
    CONSTRAINT fk_pedidos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. TABLAS DE CATÁLOGO Y RECETAS (CATEGORÍAS, PRODUCTOS, INSUMOS, RECETAS)
-- ----------------------------------------------------------------------------

CREATE TABLE categorias (
    id_categoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255),
    activo BIT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE productos (
    id_producto BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_categoria BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    precio DECIMAL(10,2) NOT NULL,
    disponible BIT(1) DEFAULT 1,
    activo BIT(1) DEFAULT 1,
    tiempo_alerta_amarilla INT DEFAULT 10, -- Minutos para advertencia
    tiempo_alerta_roja INT DEFAULT 15,     -- Minutos para retraso crítico
    CONSTRAINT fk_productos_categorias FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido (
    id_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_pedido BIGINT NOT NULL,
    id_producto BIGINT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    comentarios VARCHAR(500),
    estado_preparacion VARCHAR(30) DEFAULT 'EN_ESPERA', -- EN_ESPERA, EN_PREPARACION, LISTO, ENTREGADO
    fecha_recibido DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_inicio_preparacion DATETIME NULL,
    fecha_listo DATETIME NULL,
    fecha_retirado DATETIME NULL,
    fecha_cancelado DATETIME NULL,
    CONSTRAINT fk_detalle_pedidos FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_detalle_productos FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE insumos (
    id_insumo BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    unidad_medida VARCHAR(30) NOT NULL,
    stock_actual DECIMAL(12,2) DEFAULT 0.00,
    stock_minimo DECIMAL(12,2) DEFAULT 10.00,
    activo BIT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE recetas (
    id_receta BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_producto BIGINT NOT NULL UNIQUE,
    instrucciones TEXT,
    CONSTRAINT fk_recetas_productos FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
) ENGINE=InnoDB;

CREATE TABLE receta_detalle (
    id_receta_detalle BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_receta BIGINT NOT NULL,
    id_insumo BIGINT NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_recetadet_recetas FOREIGN KEY (id_receta) REFERENCES recetas(id_receta),
    CONSTRAINT fk_recetadet_insumos FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo)
) ENGINE=InnoDB;

CREATE TABLE insumos_sustitutos (
    id_insumo_sustituto BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_insumo BIGINT NOT NULL,
    id_insumo_sustituto_ref BIGINT NOT NULL,
    observacion VARCHAR(255),
    CONSTRAINT fk_sustitutos_original FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT fk_sustitutos_remplazo FOREIGN KEY (id_insumo_sustituto_ref) REFERENCES insumos(id_insumo)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. TABLAS CAJA, FACTURACIÓN Y PROPINAS (TURNOS, MÉTODOS PAGO, PROMPCIONES)
-- ----------------------------------------------------------------------------

CREATE TABLE turnos_caja (
    id_turno BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_final DECIMAL(10,2) NULL,
    diferencia DECIMAL(10,2) DEFAULT 0.00,
    observacion_cierre VARCHAR(500),
    estado VARCHAR(30) DEFAULT 'ABIERTA', -- ABIERTA, CERRADA
    CONSTRAINT fk_turnoscaja_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE metodos_pago (
    id_metodo_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    activo BIT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE comprobantes (
    id_comprobante BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta BIGINT NOT NULL,
    tipo_comprobante VARCHAR(30) NOT NULL, -- BOLETA, FACTURA
    serie VARCHAR(10) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(10,2) NOT NULL,
    impuesto DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    estado_sunat VARCHAR(30) DEFAULT 'ACEPTADO',
    codigo_hash VARCHAR(80),
    enlace_encuesta VARCHAR(500),
    xml_sunat_url VARCHAR(255),
    CONSTRAINT fk_comprobantes_cuentas FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta)
) ENGINE=InnoDB;

CREATE TABLE pagos (
    id_pago BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta BIGINT NOT NULL,
    id_turno BIGINT NOT NULL,
    id_metodo_pago BIGINT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    monto_recibido DECIMAL(10,2) NULL,
    vuelto DECIMAL(10,2) DEFAULT 0.00,
    fecha_pago DATETIME DEFAULT CURRENT_TIMESTAMP,
    referencia VARCHAR(150),
    estado VARCHAR(30) DEFAULT 'PROCESADO',
    CONSTRAINT fk_pagos_cuentas FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta),
    CONSTRAINT fk_pagos_turnos FOREIGN KEY (id_turno) REFERENCES turnos_caja(id_turno),
    CONSTRAINT fk_pagos_metodos FOREIGN KEY (id_metodo_pago) REFERENCES metodos_pago(id_metodo_pago)
) ENGINE=InnoDB;

CREATE TABLE promociones (
    id_promocion BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    tipo_descuento VARCHAR(30) NOT NULL, -- PORCENTAJE, MONTO_FIJO
    valor DECIMAL(10,2) NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    activa BIT(1) DEFAULT 1
) ENGINE=InnoDB;

CREATE TABLE cuenta_promocion (
    id_cuenta_promocion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta BIGINT NOT NULL,
    id_promocion BIGINT NOT NULL,
    descuento_decimal DECIMAL(10,2) NOT NULL,
    id_usuario_autorizador BIGINT NOT NULL,
    fecha_aplicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ctaprom_cuentas FOREIGN KEY (id_cuenta) REFERENCES cuentas(id_cuenta),
    CONSTRAINT fk_ctaprom_promociones FOREIGN KEY (id_promocion) REFERENCES promociones(id_promocion),
    CONSTRAINT fk_ctaprom_usuarios FOREIGN KEY (id_usuario_autorizador) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE propinas_turno (
    id_propina BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_turno BIGINT NOT NULL,
    id_usuario_mozo BIGINT NOT NULL,
    monto_propina DECIMAL(12,4) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_propinas_turno FOREIGN KEY (id_turno) REFERENCES turnos_caja(id_turno),
    CONSTRAINT fk_propinas_mozo FOREIGN KEY (id_usuario_mozo) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. AUDITORÍAS, INCIDENTES Y AUTORIZACIONES (PIN, MERMAS, HISTORIALES)
-- ----------------------------------------------------------------------------

CREATE TABLE autorizaciones_pin (
    id_autorizacion BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario_solicitante BIGINT NOT NULL,
    id_usuario_autorizador BIGINT NOT NULL,
    operacion VARCHAR(150) NOT NULL,
    fecha_autorizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    resultado VARCHAR(30) DEFAULT 'APROBADO',
    observacion VARCHAR(500),
    CONSTRAINT fk_autpin_solic FOREIGN KEY (id_usuario_solicitante) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_autpin_autoriz FOREIGN KEY (id_usuario_autorizador) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE mermas (
    id_merma BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_insumo BIGINT NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    id_administrador_autoriza BIGINT NULL,
    CONSTRAINT fk_mermas_insumo FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT fk_mermas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_mermas_admin FOREIGN KEY (id_administrador_autoriza) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE incidentes_cocina (
    id_incidente BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_detalle BIGINT NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    fecha_incidente DATETIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    estado VARCHAR(30) DEFAULT 'REGISTRADO',
    CONSTRAINT fk_incidentes_detalle FOREIGN KEY (id_detalle) REFERENCES detalle_pedido(id_detalle),
    CONSTRAINT fk_incidentes_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE historial_comanda (
    id_historial BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_detalle BIGINT NOT NULL,
    estado_anterior VARCHAR(30),
    estado_nuevo VARCHAR(30) NOT NULL,
    id_usuario BIGINT NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacion VARCHAR(500),
    CONSTRAINT fk_histcom_detalle FOREIGN KEY (id_detalle) REFERENCES detalle_pedido(id_detalle),
    CONSTRAINT fk_histcom_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE movimientos_inventario (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_insumo BIGINT NOT NULL,
    id_usuario BIGINT NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL, -- ENTRADA, SALIDA, MERMA, REAJUSTE
    cantidad DECIMAL(12,2) NOT NULL,
    stock_anterior DECIMAL(12,2) NOT NULL,
    stock_nuevo DECIMAL(12,2) NOT NULL,
    motivo VARCHAR(255),
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movinv_insumos FOREIGN KEY (id_insumo) REFERENCES insumos(id_insumo),
    CONSTRAINT fk_movinv_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE movimientos_caja (
    id_movimiento BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_turno BIGINT NOT NULL,
    tipo_movimiento VARCHAR(30) NOT NULL, -- INGRESO_MANUAL, RETIRO_MANUAL, VENTA
    monto DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255),
    fecha_movimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movcaja_turno FOREIGN KEY (id_turno) REFERENCES turnos_caja(id_turno)
) ENGINE=InnoDB;

CREATE TABLE notas_credito (
    id_nota_credito BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_comprobante_origen BIGINT NOT NULL,
    id_administrador BIGINT NOT NULL,
    serie_correlativo VARCHAR(20) NOT NULL,
    motivo_devolucion TEXT NOT NULL,
    monto_devuelto DECIMAL(10,2) NOT NULL,
    estado_sunat VARCHAR(30) DEFAULT 'ACEPTADO',
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notacred_comprobante FOREIGN KEY (id_comprobante_origen) REFERENCES comprobantes(id_comprobante),
    CONSTRAINT fk_notacred_admin FOREIGN KEY (id_administrador) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id_auditoria BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NULL,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id BIGINT NULL,
    descripcion VARCHAR(1000),
    fecha DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_auditoria_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE historial_precios (
    id_historial_precio BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_producto BIGINT NOT NULL,
    precio_anterior DECIMAL(10,2) NOT NULL,
    precio_nuevo DECIMAL(10,2) NOT NULL,
    usuario_cambia BIGINT NOT NULL,
    fecha_cambio DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo VARCHAR(255),
    CONSTRAINT fk_histpre_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto),
    CONSTRAINT fk_histpre_usuario FOREIGN KEY (usuario_cambia) REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- ============================================================================
-- DATA SEMILLA INICIAL (DATOS MAESTROS Y CONFIGURACIÓN)
-- ============================================================================

-- 1. Insertar Roles
INSERT INTO roles (id_rol, nombre, descripcion) VALUES
(1, 'ADMIN', 'Administrador del sistema con acceso total'),
(2, 'SERVER', 'Mozo/Server de atención en salón'),
(3, 'COCINA', 'Personal de cocina/KDS'),
(4, 'CAJERO', 'Personal de caja y cobros'),
(5, 'ANFITRIONA', 'Recepción y manejo de lista de espera');

-- 2. Insertar Personal
INSERT INTO personal (id_personal, nombres, apellidos, dni, telefono) VALUES
(1, 'Elvis Wilson', 'Alcántara Pinedo', '11111111', '999111222'),
(2, 'Renato Enrique', 'Ledesma Lozada', '22222222', '999222333'),
(3, 'Paola Lucia', 'Olivos Espinoza', '33333333', '999333444'),
(4, 'Alvaro', 'Acosta Vílchez', '44444444', '999444555'),
(5, 'John', 'Wualker Zarazu', '55555555', '999555666');

-- 3. Insertar Usuarios Demo
-- Actualizar los hashes BCrypt válidos para los usuarios demo (Contraseña para todos: 123456)
UPDATE usuarios SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE usuario = 'admin';
UPDATE usuarios SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE usuario = 'mozo1';
UPDATE usuarios SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE usuario = 'cocinero1';
UPDATE usuarios SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE usuario = 'cajero1';
UPDATE usuarios SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy' WHERE usuario = 'anfitriona1';

-- Actualizar el PIN de administrador válido (PIN: 1234)
UPDATE usuarios SET pin_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.' WHERE usuario = 'admin';

-- 4. Insertar Mesas Iniciales del Salón
INSERT INTO mesas (id_mesa, numero_mesa, capacidad, ubicacion, estado) VALUES
(1, 1, 4, 'SALON', 'LIBRE'),
(2, 2, 2, 'SALON', 'LIBRE'),
(3, 3, 4, 'SALON', 'LIBRE'),
(4, 4, 6, 'TERRAZA', 'LIBRE'),
(5, 5, 8, 'TERRAZA', 'LIBRE'),
(6, 6, 2, 'BARRA', 'LIBRE'),
(7, 7, 4, 'SALON', 'LIBRE'),
(8, 8, 4, 'SALON', 'LIBRE'),
(9, 9, 6, 'SALON', 'LIBRE'),
(10, 10, 2, 'BARRA', 'LIBRE');

-- 5. Insertar Categorías del Menú de Chili's
INSERT INTO categorias (id_categoria, nombre, descripcion) VALUES
(1, 'Hamburguesas', 'Craft Burgers preparadas a la parrilla con carne premium'),
(2, 'Costillas & Ribs', 'Baby Back Ribs bañadas en salsa BBQ artesanal'),
(3, 'Fajitas & Tex-Mex', 'Servidas en sartenes calientes con guacamole y tortillas'),
(4, 'Bebidas & Margaritas', 'Margaritas hechas a mano, cocktails y gaseosas'),
(5, 'Postres', 'Nuestros emblemáticos postres caseros');

-- 6. Insertar Productos Comerciales
INSERT INTO productos (id_producto, id_categoria, nombre, descripcion, precio, disponible, tiempo_alerta_amarilla, tiempo_alerta_roja) VALUES
(1, 1, 'Oldtimer with Cheese', 'Hamburguesa clásica con queso cheddar, lechuga, tomate y pepinillos', 39.90, 1, 8, 12),
(2, 1, 'Presidente Burger', 'Queso cheddar, tocino ahumado, aros de cebolla y salsa BBQ', 45.90, 1, 10, 15),
(3, 2, 'Original Baby Back Ribs Full Rack', 'Costillas bañadas en salsa BBQ artesanal con papas fritas', 79.90, 1, 12, 18),
(4, 3, 'Sizzling Chicken Fajitas', 'Pechuga de pollo a la parrilla con pimientos y cebollas salteadas', 49.90, 1, 10, 15),
(5, 4, 'Presidente Margarita', 'Tequila de reserva, Cointreau y Brandy batido a mano', 29.90, 1, 3, 5),
(6, 4, 'Limonada Chili s', 'Refrescante limonada natural recién hecha', 12.90, 1, 2, 4),
(7, 5, 'Molten Chocolate Cake', 'Pastel de chocolate tibio con centro de chocolate líquido y helado de vainilla', 28.90, 1, 5, 8);

-- 7. Insertar Métodos de Pago Integrados
INSERT INTO metodos_pago (id_metodo_pago, nombre) VALUES
(1, 'EFECTIVO'),
(2, 'TARJETA_CREDITO_DEBITO'),
(3, 'BILLETERA_DIGITAL_QR');

-- 8. Apertura de Caja Diaria Demo para Pruebas Inmediatas
INSERT INTO turnos_caja (id_turno, id_usuario, monto_inicial, estado) VALUES
(1, 4, 300.00, 'ABIERTA');


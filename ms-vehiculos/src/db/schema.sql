CREATE DATABASE IF NOT EXISTS logired_vehiculos
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE logired_vehiculos;

-- Tabla de vehículos
CREATE TABLE IF NOT EXISTS vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    tipo VARCHAR(50) NOT NULL,
    capacidad_kg DECIMAL(10,2) NOT NULL,
    estado VARCHAR(30) NOT NULL,
    conductor_id INT NULL
);
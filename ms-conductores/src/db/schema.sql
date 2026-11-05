-- db/schema.sql

SET NAMES utf8mb4;

CREATE TABLE conductores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(10) UNIQUE NOT NULL,
    telefono VARCHAR(10) UNIQUE NOT NULL,
    categoria_licencia VARCHAR(2) NOT NULL,
    sede VARCHAR(50) NOT NULL
);

INSERT INTO conductores (nombre, apellido, cedula, telefono, categoria_licencia, sede) VALUES
('Juan', 'Pérez', '1234567890', '555123489', 'c2', 'cali'),
('María', 'Gómez', '0987654321', '555987654', 'c3', 'medellin'),
('Carlos', 'López', '1122334455', '555432198', 'c2', 'bogota');
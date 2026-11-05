
SET NAMES utf8mb4;             

CREATE TABLE clientes (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(100) NOT NULL,
  documento VARCHAR(15)  NOT NULL UNIQUE,
  telefono  VARCHAR(10)  NOT NULL,
  email     VARCHAR(120) NOT NULL,
  ciudad    VARCHAR(60)  NOT NULL
);

INSERT INTO clientes (nombre, documento, telefono, email, ciudad) VALUES
  ('Distribuidora El Valle', '900123456', '3001112233', 'contacto@elvalle.com', 'Cali'),
  ('Comercial Andina', '900234567', '3002223344', 'ventas@andina.com', 'Bogotá'),
  ('Tienda La Esquina', '900345678', '3003334455', 'info@laesquina.com', 'Medellín');
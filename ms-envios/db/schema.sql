SET NAMES utf8mb4;

CREATE TABLE envios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  origen VARCHAR(100) NOT NULL,
  destino VARCHAR(100) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  cliente_id INT NOT NULL
);

INSERT INTO envios (codigo, origen, destino, estado, cliente_id) VALUES
('ENV-001', 'Cali', 'Bogotá', 'en transito', 1),
('ENV-002', 'Medellín', 'Cali', 'entregado', 2),
('ENV-003', 'Cali', 'Cartagena', 'pendiente', 1);
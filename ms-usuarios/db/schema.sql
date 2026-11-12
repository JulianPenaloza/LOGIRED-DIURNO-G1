USE usuarios_db;
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien

CREATE TABLE usuarios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nombre         VARCHAR(100) NOT NULL,
  email          VARCHAR(120) NOT NULL UNIQUE,
  password_hash  VARCHAR(100) NOT NULL,      -- la contraseña cifrada con bcrypt, nunca en texto plano
  rol            VARCHAR(30)  NOT NULL,
  activo         BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Usuario inicial para poder iniciar sesión por primera vez.
-- Email: admin@empresa.com   Contraseña: Admin2026*
-- Cámbienle la contraseña (PUT /usuarios/1) apenas despliegue la aplicación.
INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES
  ('Administrador General', 'admin@empresa.com',
   '$2b$10$O7aBlpBQjnWE69ssLR1Nr.pNZpZiIx3r4kGZGsRHeEkM6SVhg.mUS', 'administrador', TRUE);

-- Usuarios de ejemplo para pruebas.
--{
--  "nombre": "Andres Gomez",
--  "email": "andres.flota@logired.com",
--  "password": "Flota123*",
--  "rol": "flota"
-- }
-- {
--  "nombre": "Laura Martinez",
--  "email": "laura.despacho@logired.com",
--  "password_hash": "Despacho123",
--  "rol": "despacho",
--  "activo": true
-- }

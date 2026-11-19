-- Ejecutar en servidor1 como root de MySQL: sudo mysql < crear-bd-clientes.sql
-- Antes de ejecutar, reemplace ESCRIBA-SU-CLAVE por la clave real
-- (solo letras y numeros). NO suba la clave real al repositorio.

CREATE DATABASE IF NOT EXISTS clientes_db CHARACTER SET utf8mb4;

-- Solo servidor2 puede conectarse (ufw tambien limita el puerto 3306)
CREATE USER IF NOT EXISTS 'clientes_user'@'172.24.0.132' IDENTIFIED BY 'ESCRIBA-SU-CLAVE';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.24.0.132';
FLUSH PRIVILEGES;

-- Luego cargar las tablas: mysql -u root clientes_db < ms-clientes/db/schema.sql

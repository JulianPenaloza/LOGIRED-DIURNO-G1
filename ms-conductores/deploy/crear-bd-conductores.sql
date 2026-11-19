-- Ejecutar en servidor1 como root de MySQL: sudo mysql < crear-bd-conductores.sql
-- Antes de ejecutar, reemplace ESCRIBA-SU-CLAVE por la clave real
-- (solo letras y numeros). NO suba la clave real al repositorio.

CREATE DATABASE IF NOT EXISTS conductores_db CHARACTER SET utf8mb4;

-- Solo servidor2 puede conectarse (ufw tambien limita el puerto 3306)
CREATE USER IF NOT EXISTS 'conductores_user'@'172.24.0.132' IDENTIFIED BY 'ESCRIBA-SU-CLAVE';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'172.24.0.132';
FLUSH PRIVILEGES;

-- Luego cargar las tablas: mysql -u root conductores_db < ms-conductores/db/schema.sql
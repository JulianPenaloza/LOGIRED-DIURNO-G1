# LOGIRED - Sistema de Microservicios

Empresa: LogiRed
Jornada: Diurno - Grupo 1

## Integrantes y Asignación de Microservicios

| Integrante | Usuario de GitHub | Versión de Node | Carpeta a cargo | Puerto | Depende de |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Docente | N/A | N/A | `ms-usuarios` | 3001 | Ninguno |
| Jesús David Albarracín | jesusalba15 | v24.22.1 | `ms-clientes` | 3002 | Ninguno |
| Julián Jair Peñaloza | JulianPenaloza | v22.x | `ms-envios` | 3003 | ms-clientes |
| José Andrés Criollo | jose2231411 | v24.15.0 | `ms-conductores` | 3004 | Ninguno |
| Bryan Andrés Peñaranda | Bryan25062002 | v22.15.0 | `ms-vehiculos` | 3005 | ms-conductores |

## Estructura del Repositorio
- `ms-usuarios/`: Entregado por la docente (nadie lo modifica).
- `ms-clientes/`: Gestión de clientes de la empresa.
- `ms-envios/`: Gestión y seguimiento de envíos (guías, origen, destino y estado).
- `ms-conductores/`: Gestión del personal de conducción.
- `ms-vehiculos/`: Gestión de la flota de transporte.
- `frontend/`: Interfaz web conectada al API Gateway (`http://app.logired.com.co`).

## Relaciones

`ms-envios` guarda la referencia de los clientes (`cliente_id`) y se comunica de forma síncrona con `ms-clientes` para validar su existencia y componer los datos en las consultas.

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
| :--- | :--- | :--- | :--- | :--- |
| `cliente_id` | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` | id, nombre, ciudad |

`ms-envios` reenvía el token JWT recibido del usuario en cada petición hacia `ms-clientes` para cumplir con los requisitos de seguridad de ambos servicios.

## Guía de Despliegue (Taller 3 - M3)

### Topología de servidores
- `servidor1` (`172.24.0.134`): DNS (`bind9` para `app.logired.com.co`) y MySQL (`3306` restringido a `172.24.0.132` por `bind-address`, usuario `@'172.24.0.132'` y `ufw`).
- `servidor2` (`172.24.0.132`): Apache (`80`) como API Gateway (`/api/<recurso>`) y servidor del frontend (`/var/www/app`), junto con los 5 microservicios escuchando en `127.0.0.1:3001-3005` bajo `systemd`.

### 1. Base de datos y DNS en `servidor1`
1. En `/etc/mysql/mysql.conf.d/mysqld.cnf`, configurar `bind-address = 127.0.0.1,172.24.0.134` y reiniciar `mysql`.
2. Abrir `3306/tcp` en `ufw` solo para `servidor2` (`sudo ufw allow from 172.24.0.132 to any port 3306 proto tcp`).
3. Crear las bases de datos y usuarios restringidos a `@'172.24.0.132'` usando los scripts en `deploy/` de cada microservicio (con contraseña propia en producción).
4. Agregar el registro `app` apuntando a `servidor2` en la zona directa de `bind9`, incrementar el serial, verificar con `named-checkzone` y recargar `bind9`.

### 2. Microservicios en `servidor2`
1. Instalar Node.js LTS (22.x), crear el usuario del sistema `nodeapps` y clonar el repositorio en `/srv/logired/app`.
2. Para cada microservicio: cargar `db/schema.sql` hacia `172.24.0.134`, ejecutar `npm ci --omit=dev`, crear `.env` desde `.env.example` (sin subir `.env` a Git) con `chmod 640 .env` y grupo `nodeapps`, copiar su `.service` desde `deploy/` a `/etc/systemd/system/`, recargar `systemd` y habilitar con `sudo systemctl enable --now ms-<recurso>`.
3. Mantener en `ufw` de `servidor2` solo `22/tcp` y `80/tcp` abiertos.

### 3. API Gateway y Frontend en Apache (`servidor2`)
1. Habilitar `proxy` y `proxy_http` (`sudo a2enmod proxy proxy_http`).
2. Configurar el host virtual `app.logired.com.co` en `/etc/apache2/sites-available/app.conf` con `ProxyPass` y `ProxyPassReverse` hacia `http://127.0.0.1:300X/<recurso>`.
3. Validar con `sudo apache2ctl configtest`, habilitar con `sudo a2ensite app.conf` y recargar `apache2`.
4. Copiar el frontend a `/var/www/app/` (`sudo cp -r /srv/logired/app/frontend/* /var/www/app/`).

### 4. Pruebas de verificación
- Desde Windows: `nslookup app.logired.com.co` debe resolver a `172.24.0.132`.
- Verificar que `curl.exe http://172.24.0.132:3003/health` y `Test-NetConnection 172.24.0.134 -Port 3306` fallen desde Windows.
- Iniciar sesión en `http://app.logired.com.co` y ejecutar las colecciones de Postman con base `http://app.logired.com.co/api`.

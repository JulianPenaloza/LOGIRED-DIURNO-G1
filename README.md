# LOGIRED — Sistema de Microservicios

**Empresa:** LogiRed  
**Jornada:** Diurno — Grupo 1  
**Arquitectura:** frontend web + gateway Apache + microservicios Node.js/Express + MySQL  
**Dominio de despliegue:** `logired.com.co`

## 1. Integrantes y asignación de microservicios

| Integrante | Usuario de GitHub | Versión de Node | Carpeta a cargo | Puerto | Depende de |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Docente | N/A | N/A | `ms-usuarios` | 3001 | Ninguno |
| Jesús David Albarracín | `jesusalba15` | v24.22.1 | `ms-clientes` | 3002 | Ninguno |
| Julián Jair Peñaloza | `JulianPenaloza` | v22.x | `ms-envios` | 3003 | `ms-clientes` |
| José Andrés Criollo | `jose2231411` | v24.15.0 | `ms-conductores` | 3004 | Ninguno |
| Bryan Andrés Peñaranda | `Bryan25062002` | v22.15.0 | `ms-vehiculos` | 3005 | `ms-conductores` |

> Las versiones de Node de la tabla corresponden a los entornos de desarrollo individuales. En servidor2 se debe instalar una versión compatible con **todos** los `package.json` del proyecto.

## 2. Estructura del repositorio

```text
LOGIRED-DIURNO-G1/
├── ms-usuarios/       # Autenticación, usuarios y roles
├── ms-clientes/       # Gestión de clientes
├── ms-envios/         # Gestión y seguimiento de envíos
├── ms-conductores/    # Gestión de conductores
├── ms-vehiculos/      # Gestión de flota
└── frontend/          # Interfaz web (si está incluida en el repositorio)
```

`ms-usuarios` fue entregado por la docente; se despliega y configura sin modificar su lógica de negocio, salvo los ajustes expresamente autorizados para el entorno.

Cada microservicio mantiene su propia base de datos y sus dependencias npm. La estructura exacta de archivos (`src/`, `db/schema.sql`, etc.) debe comprobarse en cada carpeta.

## 3. Arquitectura de despliegue

| Componente | Máquina | Dirección | Puerto | Acceso |
| :--- | :--- | :--- | :--- | :--- |
| DNS (`bind9`) | `ser1-cd-cali` | `172.24.0.134` | 53 TCP/UDP | Red privada |
| MySQL | `ser1-cd-cali` | `172.24.0.134` | 3306 TCP | Solo servidor2 |
| Apache (frontend + gateway) | `ser2-cd-cali` | `172.24.0.132` | 80 TCP | Clientes de la red privada |
| `ms-usuarios` | `ser2-cd-cali` | `127.0.0.1` | 3001 | Solo servidor2 |
| `ms-clientes` | `ser2-cd-cali` | `127.0.0.1` | 3002 | Solo servidor2 |
| `ms-envios` | `ser2-cd-cali` | `127.0.0.1` | 3003 | Solo servidor2 |
| `ms-conductores` | `ser2-cd-cali` | `127.0.0.1` | 3004 | Solo servidor2 |
| `ms-vehiculos` | `ser2-cd-cali` | `127.0.0.1` | 3005 | Solo servidor2 |
| Windows (cliente de pruebas) | Host | `172.24.0.136` | — | Frontend y gateway |

**Flujo de una solicitud:**

```text
Navegador / Postman (Windows)
         │ http://app.logired.com.co
         ▼
Apache en servidor2 (172.24.0.132:80)
         ├── archivos estáticos del frontend
         └── /api/* → proxy HTTP → microservicios en 127.0.0.1:3001–3005
                                          │
                                          ▼
                               MySQL en servidor1
                               (172.24.0.134:3306)
```

Los microservicios no deben escuchar en `0.0.0.0` ni exponer sus puertos a Windows. La conexión MySQL sí requiere acceso desde servidor2 a servidor1.

## 4. Relaciones entre microservicios

### 4.1. Envíos → Clientes

`ms-envios` guarda `cliente_id` y consulta `ms-clientes` para validar la existencia del cliente y componer la respuesta.

| Atributo | Servicio consultado | Validación (crear/actualizar) | Composición (consultar) | Datos utilizados |
| :--- | :--- | :--- | :--- | :--- |
| `cliente_id` | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` | `id`, `nombre`, `ciudad` |

`ms-envios` reenvía el JWT recibido hacia `ms-clientes` cuando realiza solicitudes internas protegidas.

### 4.2. Vehículos → Conductores

`ms-vehiculos` guarda `conductor_id` y consulta `ms-conductores` para validar la asignación y componer el listado de vehículos.

| Atributo | Servicio consultado | Validación (crear/actualizar) | Composición (consultar) | Datos utilizados |
| :--- | :--- | :--- | :--- | :--- |
| `conductor_id` | `ms-conductores` | `GET /conductores/:id` | `GET /conductores?ids=...` | `id`, `nombre`, `categoria_licencia`, `telefono`, `sede` |

Cuando hay varios conductores, la composición debe usar **una consulta por lotes** (`?ids=1,2,3`) en vez de una petición individual por cada registro. El campo `conductor_id` puede ser nulo si el contrato del servicio permite vehículos sin conductor asignado.

### 4.3. Fallos de dependencias

El frontend debe mostrar un aviso comprensible cuando un servicio relacionado no está disponible, sin bloquear toda la página. Cuando una operación de creación necesita validar una referencia y el servicio consultado no responde, se espera un **HTTP 503**, conforme al contrato de integración del taller. La respuesta exacta depende de la implementación del servicio consumidor.

## 5. Preparación de las máquinas virtuales

Las siguientes instrucciones presuponen **Ubuntu con `apt`**, acceso `sudo` y una red privada donde servidor1 y servidor2 pueden comunicarse. Se recomienda realizar un respaldo o snapshot antes de modificar servicios existentes.

### 5.1. Comprobar direcciones y conectividad

En cada VM:

```bash
hostname
ip -br addr
```

Desde servidor2:

```bash
ping -c 3 172.24.0.134
```

Desde Windows (PowerShell):

```powershell
nslookup app.logired.com.co
```

El registro `app.logired.com.co` debe resolver a `172.24.0.132`. Si Windows utiliza otro DNS, configurarlo para consultar el DNS privado de LogiRed antes de continuar.

## 6. Servidor1: MySQL, usuarios y DNS

### 6.1. Instalar MySQL

En `ser1-cd-cali`:

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo systemctl status mysql
```

Editar la configuración del servidor MySQL (la ubicación puede variar según la versión):

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Configurar:

```ini
[mysqld]
bind-address = 172.24.0.134
```

Reiniciar y comprobar:

```bash
sudo systemctl restart mysql
sudo ss -lntp | grep 3306
```

### 6.2. Crear las bases de datos y usuarios

Se utiliza **una base de datos y un usuario de MySQL por microservicio**, con las credenciales acordadas por el grupo. Los nombres siguientes son los del despliegue LogiRed; sustituir los valores de contraseña por secretos propios.

```bash
sudo mysql
```

```sql
CREATE DATABASE IF NOT EXISTS usuarios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS clientes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS envios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS conductores_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS vehiculos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear solo los usuarios que aún no existan. Reemplazar cada contraseña.
CREATE USER IF NOT EXISTS 'usuarios_user'@'172.24.0.132' IDENTIFIED BY 'CAMBIAR_CLAVE_USUARIOS';
CREATE USER IF NOT EXISTS 'clientes_user'@'172.24.0.132' IDENTIFIED BY 'CAMBIAR_CLAVE_CLIENTES';
CREATE USER IF NOT EXISTS 'envios_user'@'172.24.0.132' IDENTIFIED BY 'CAMBIAR_CLAVE_ENVIOS';
CREATE USER IF NOT EXISTS 'conductores_user'@'172.24.0.132' IDENTIFIED BY 'CAMBIAR_CLAVE_CONDUCTORES';
CREATE USER IF NOT EXISTS 'vehiculos_user'@'172.24.0.132' IDENTIFIED BY 'CAMBIAR_CLAVE_VEHICULOS';

GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'172.24.0.132';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.24.0.132';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'172.24.0.132';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'172.24.0.132';
GRANT ALL PRIVILEGES ON vehiculos_db.* TO 'vehiculos_user'@'172.24.0.132';
```

> `CREATE USER IF NOT EXISTS` **no actualiza** la contraseña de un usuario ya existente. En un servidor previamente configurado, comprobar las cuentas del grupo y usar `ALTER USER` cuando corresponda. No ejecutar cambios de contraseñas sin coordinar las variables `.env` de cada servicio. Para un despliegue de mayor seguridad, reducir privilegios tras ejecutar los esquemas iniciales.

Aplicar los scripts `schema.sql` de cada microservicio desde el servidor que tenga los archivos disponibles. **Comprobar previamente** si cada script contiene `CREATE DATABASE`, `USE` o datos semilla para evitar duplicaciones o conflictos. Ejemplo, si se copió el esquema al servidor1:

```bash
sudo mysql conductores_db < /ruta/real/ms-conductores/db/schema.sql
```

Repetir para las demás bases de datos, ajustando la ruta. No asumir que todos los repositorios guardan `schema.sql` en el mismo directorio.

### 6.3. Restringir MySQL con UFW

```bash
sudo ufw allow from 172.24.0.132 to any port 3306 proto tcp
sudo ufw status numbered
```

Si ya existe una regla amplia que exponga `3306`, eliminarla con cuidado. No habilitar UFW sin comprobar primero que SSH esté permitido, para evitar perder el acceso remoto.

### 6.4. Registro DNS de la aplicación

En la zona directa de `bind9` correspondiente a `logired.com.co`, agregar o comprobar:

```dns
app    IN    A    172.24.0.132
```

Incrementar el **serial SOA** de la zona, validar el archivo y recargar `bind9`:

```bash
sudo named-checkconf
sudo named-checkzone logired.com.co /ruta/real/de/la/zona
sudo systemctl reload bind9
```

La ruta de zona debe tomarse de la configuración real de `named.conf.local`; no sobrescribir una zona existente con un archivo de ejemplo.

## 7. Servidor2: Node.js y despliegue de microservicios

### 7.1. Instalar dependencias del sistema

En `ser2-cd-cali`:

```bash
sudo apt update
sudo apt install -y git curl apache2
node --version
npm --version
```

Si Node.js no está instalado, instalar una versión compatible con los cinco servicios usando el método aprobado para el entorno (por ejemplo, paquetes de distribución o un repositorio oficial adecuado). Verificar después `which node` y `node --version`; la ruta usada por `systemd` debe corresponder al binario instalado.

### 7.2. Crear usuario de servicio y clonar el repositorio

```bash
sudo useradd --system --create-home --home-dir /srv/nodeapps --shell /usr/sbin/nologin nodeapps
sudo mkdir -p /srv/logired
sudo chown -R nodeapps:nodeapps /srv/logired
```

Si `nodeapps` ya existe, omitir `useradd`. Clonar el repositorio con una cuenta que tenga permiso de lectura:

```bash
sudo -u nodeapps git clone <URL_REAL_DEL_REPOSITORIO> /srv/logired/app
```

Si el repositorio es privado, configurar previamente un método de autenticación apropiado. No introducir tokens personales en la URL ni en el README.

### 7.3. Instalar dependencias npm

```bash
for svc in ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos; do
  cd "/srv/logired/app/$svc" || exit 1
  if [ -f package-lock.json ]; then sudo -u nodeapps npm ci --omit=dev; else sudo -u nodeapps npm install --omit=dev; fi
done
```

Comprobar que cada `package.json` declare todas las dependencias de ejecución. Por ejemplo, si una aplicación importa `cors`, debe estar en `dependencies` y no depender de una instalación manual fuera del repositorio.

### 7.4. Configurar `.env` en cada servicio

Cada carpeta de microservicio debe tener su propio `.env` con **valores reales no publicados en Git**. Ejemplo para `ms-conductores`:

```dotenv
PORT=3004
HOST=127.0.0.1
DB_HOST=172.24.0.134
DB_PORT=3306
DB_NAME=conductores_db
DB_USER=conductores_user
DB_PASSWORD=<CLAVE_REAL_DEL_GRUPO>
JWT_SECRET=<SECRETO_JWT_COMPARTIDO>
```

Correspondencias:

| Servicio | `PORT` | `DB_NAME` | `DB_USER` (ejemplo) |
| :--- | ---: | :--- | :--- |
| `ms-usuarios` | 3001 | `usuarios_db` | `usuarios_user` |
| `ms-clientes` | 3002 | `clientes_db` | `clientes_user` |
| `ms-envios` | 3003 | `envios_db` | `envios_user` |
| `ms-conductores` | 3004 | `conductores_db` | `conductores_user` |
| `ms-vehiculos` | 3005 | `vehiculos_db` | `vehiculos_user` |

**Importante:** `HOST` es ilustrativa; algunos servicios usan `APP_HOST` o tienen el host fijado en código. Comprobar el archivo de entrada de cada servicio para asegurar que escucha en `127.0.0.1`. Del mismo modo, confirmar los nombres exactos de variables DB y de URL de dependencias en el código. Para llamadas internas, utilizar direcciones como `http://127.0.0.1:3002` (clientes) y `http://127.0.0.1:3004` (conductores), según las variables reales que espere cada servicio.

El `JWT_SECRET` debe coincidir entre el emisor (`ms-usuarios`) y los verificadores. **Rotar la clave invalida los tokens anteriores**: reiniciar los servicios afectados y volver a iniciar sesión. No incluir el secreto ni los tokens en capturas o commits.

Asegurar los archivos de entorno:

```bash
sudo chown nodeapps:nodeapps /srv/logired/app/ms-*/.env
sudo chmod 600 /srv/logired/app/ms-*/.env
```

### 7.5. Crear servicios `systemd`

Crear un servicio por microservicio. Ejemplo para `ms-conductores`:

```bash
sudo nano /etc/systemd/system/ms-conductores.service
```

```ini
[Unit]
Description=LogiRed - ms-conductores
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=nodeapps
Group=nodeapps
WorkingDirectory=/srv/logired/app/ms-conductores
Environment=NODE_ENV=production
ExecStart=/usr/bin/node --env-file=.env src/index.js
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
```

**Ajustes obligatorios:** confirmar que Node está en `/usr/bin/node`, que existe `src/index.js` y que la versión instalada soporta `--env-file`. Si el servicio usa otro archivo de entrada o carga dotenv desde código, adaptar `ExecStart` sin duplicar innecesariamente la carga de variables.

Crear unidades equivalentes para `ms-usuarios`, `ms-clientes`, `ms-envios` y `ms-vehiculos`, cambiando `WorkingDirectory`, `Description` y, si corresponde, `ExecStart`.

Activar e iniciar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos
sudo systemctl status ms-conductores --no-pager
sudo journalctl -u ms-conductores -n 60 --no-pager
```

Comprobar puertos locales:

```bash
sudo ss -lntp | grep -E ':(3001|3002|3003|3004|3005)\b'
```

Las cinco aplicaciones deben escuchar en `127.0.0.1` y no en la IP pública/privada de la interfaz de red.

## 8. Apache: gateway y frontend

### 8.1. Activar módulos

```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo systemctl restart apache2
```

### 8.2. Configurar el VirtualHost

Ejemplo de archivo `/etc/apache2/sites-available/app.logired.com.co.conf`:

```apache
<VirtualHost *:80>
    ServerName app.logired.com.co
    DocumentRoot /var/www/logired

    <Directory /var/www/logired>
        Options -Indexes +FollowSymLinks
        AllowOverride None
        Require all granted
    </Directory>

    ProxyRequests Off

    ProxyPass        /api/usuarios     http://127.0.0.1:3001/usuarios
    ProxyPassReverse /api/usuarios     http://127.0.0.1:3001/usuarios

    ProxyPass        /api/clientes     http://127.0.0.1:3002/clientes
    ProxyPassReverse /api/clientes     http://127.0.0.1:3002/clientes

    ProxyPass        /api/envios       http://127.0.0.1:3003/envios
    ProxyPassReverse /api/envios       http://127.0.0.1:3003/envios

    ProxyPass        /api/conductores  http://127.0.0.1:3004/conductores
    ProxyPassReverse /api/conductores  http://127.0.0.1:3004/conductores

    ProxyPass        /api/vehiculos    http://127.0.0.1:3005/vehiculos
    ProxyPassReverse /api/vehiculos    http://127.0.0.1:3005/vehiculos

    ErrorLog ${APACHE_LOG_DIR}/logired-app-error.log
    CustomLog ${APACHE_LOG_DIR}/logired-app-access.log combined
</VirtualHost>
```

> **Verificar las rutas reales antes de copiar este ejemplo.** Si `ms-usuarios` expone `/auth/login` en lugar de `/usuarios/login`, se debe añadir el mapeo apropiado. Las rutas del gateway deben corresponder al contrato real de cada servicio. Evitar reglas `ProxyPass` que se solapen o que apunten a prefijos incorrectos.

Activar sitio y comprobar sintaxis:

```bash
sudo a2ensite app.logired.com.co.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

El aviso `AH00558` sobre `ServerName` no impide que `Syntax OK` sea válido; se puede corregir estableciendo un `ServerName` global adecuado.

### 8.3. Publicar el frontend

**Punto crítico del despliegue:** Apache sirve los archivos del `DocumentRoot`, **no** los archivos que se están editando en el repositorio. Si se modifica `/srv/logired/app/frontend` sin copiarlo al directorio publicado, el navegador puede continuar mostrando una versión anterior.

Ejemplo, si la estructura del frontend permite publicar directamente el contenido de `frontend/`:

```bash
sudo mkdir -p /var/www/logired
sudo rsync -av --delete /srv/logired/app/frontend/ /var/www/logired/
sudo chown -R root:www-data /var/www/logired
sudo find /var/www/logired -type d -exec chmod 755 {} \;
sudo find /var/www/logired -type f -exec chmod 644 {} \;
```

Instalar `rsync` si no está disponible (`sudo apt install -y rsync`). **Atención:** `--delete` elimina del destino archivos que no estén en el origen; utilizarlo solo cuando `/var/www/logired` esté reservado exclusivamente para esta publicación. Si el frontend necesita un proceso de compilación, publicar el directorio de salida del build en lugar de las fuentes.

Comprobar qué HTML entrega Apache realmente:

```bash
curl -s -H 'Host: app.logired.com.co' http://127.0.0.1/vehiculos.html | head -n 25
```

Si el navegador muestra contenido distinto, revisar caché (`Ctrl+Shift+R`), JavaScript que modifica el DOM y si se copió la versión correcta al `DocumentRoot`.

### 8.4. Firewall de servidor2

Permitir Apache a la red privada sin exponer los puertos Node:

```bash
sudo ufw allow from 172.24.0.0/24 to any port 80 proto tcp
sudo ufw status numbered
```

Mantener SSH permitido según la política del entorno. No crear reglas `ufw allow 3001:3005/tcp` para clientes externos.

## 9. Autenticación y roles

Los servicios utilizan JWT. El cliente envía el token mediante:

```http
Authorization: Bearer <TOKEN_JWT>
```

Los roles del proyecto son `administrador`, `despacho` y `flota`. La autorización exacta de cada endpoint depende del middleware `requiereRol` definido por su responsable. El despliegue debe incluir la actualización de la contraseña del administrador y la creación o comprobación de un usuario de prueba por rol, siguiendo los endpoints reales de `ms-usuarios`.

**No** almacenar contraseñas en texto plano en la base de datos; usar el mecanismo de hash implementado por `ms-usuarios`. No publicar contraseñas, `JWT_SECRET` ni tokens en el README.

## 10. Pruebas de integración del Taller 3

Usar en Postman la variable de colección:

```text
base_url = http://app.logired.com.co/api
```

Las peticiones protegidas deben incluir `Authorization: Bearer {{jwt_token}}`, salvo pruebas explícitas de ausencia de token.

| # | Prueba | Resultado esperado | Resultado recibido |
| ---: | :--- | :--- | :--- |
| 1 | `nslookup app.logired.com.co` desde Windows | Resuelve `172.24.0.132` | Pendiente |
| 2 | Abrir `http://app.logired.com.co` e iniciar sesión con un usuario de cada rol | Cada usuario llega a su página | Pendiente |
| 3 | `GET /api/<recurso>` sin token desde Postman | HTTP 401 | Pendiente |
| 4 | `POST /api/<recurso>` con rol sin permiso | HTTP 403 | Pendiente |
| 5 | Ejecutar las colecciones de Postman a través de `/api` | Códigos esperados en todos los casos | Pendiente |
| 6 | Desde Windows, probar puerto 300X de servidor2 y 3306 de servidor1 | Ambas conexiones fallan | Pendiente |
| 7 | Listar entidad relacionada con `journalctl -f` abierto | Datos compuestos y una consulta `?ids=` | Pendiente |
| 8 | Detener servicio relacionado, listar y luego intentar crear | Aviso en pantalla y HTTP 503 al crear | Pendiente |
| 9 | Reiniciar servidor2 y volver a abrir aplicación | Apache y microservicios inician automáticamente | Pendiente |

### 10.1. Comandos de verificación

Desde Windows PowerShell:

```powershell
nslookup app.logired.com.co
curl.exe --noproxy "*" --connect-timeout 5 http://172.24.0.132:3004/health
Test-NetConnection 172.24.0.134 -Port 3306
```

Los dos últimos intentos deben fallar **desde Windows**. Esto no implica que MySQL deba fallar desde servidor2.

Desde servidor2:

```bash
sudo journalctl -u ms-conductores -n 0 -f
```

Abrir `vehiculos.html` y verificar en el registro **una petición** similar a `GET /conductores?ids=1,2,3`. Si no aparece, comprobar que el servicio registra solicitudes HTTP: `journalctl` solo muestra lo que la aplicación escribe en sus logs.

Para la prueba de dependencia caída:

```bash
sudo systemctl stop ms-conductores
# Repetir el listado de vehículos e intentar crear uno con conductor.
sudo systemctl start ms-conductores
```

Para comprobar arranque automático:

```bash
systemctl is-enabled apache2 ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos
sudo reboot
# Tras reconectarse:
systemctl is-active apache2 ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos
```

Guardar capturas del navegador, las solicitudes de Postman y los registros relevantes. Ocultar tokens y credenciales.

## 11. Diagnóstico de problemas frecuentes

| Síntoma | Comprobaciones recomendadas |
| :--- | :--- |
| `502`/`503` desde Apache | `systemctl status ms-...`, `journalctl -u ms-...`, `ProxyPass` y puerto de destino |
| `401` inesperado | Cabecera Bearer, expiración de token y coincidencia de `JWT_SECRET` |
| `403` inesperado | Rol del JWT y middleware `requiereRol` del endpoint |
| `ECONNREFUSED` hacia MySQL | Estado de MySQL, `bind-address`, `ufw`, IP de servidor1 y credenciales |
| `Cannot find module 'cors'` u otro paquete | `package.json`, `package-lock.json` y `npm ci --omit=dev` en el servicio afectado |
| Cambios del frontend no aparecen | Copia repositorio → `DocumentRoot`, caché del navegador y HTML realmente servido por Apache |
| Un elemento del DOM existe en HTML pero no en navegador | JavaScript que reescribe el menú o reemplaza nodos mediante `innerHTML` |
| No aparece `?ids=` en `journalctl` | Revisar si hay middleware de logging y si la composición por lotes se ejecuta realmente |
| `apache2ctl configtest` muestra `AH00558` | Definir `ServerName` global; confirmar que también aparezca `Syntax OK` |

Comandos útiles:

```bash
sudo apache2ctl configtest
sudo tail -n 80 /var/log/apache2/logired-app-error.log
sudo journalctl -u ms-vehiculos -n 80 --no-pager
sudo systemctl status ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos --no-pager
```

## 12. Actualización del despliegue

Al integrar cambios del repositorio:

1. Coordinar y respaldar cualquier cambio de esquema de base de datos.
2. Actualizar el repositorio con Git usando la cuenta que tiene permisos sobre `/srv/logired/app`.
3. Ejecutar `npm ci --omit=dev` en los microservicios cuyos `package-lock.json` hayan cambiado.
4. Comprobar las variables `.env` y reiniciar solo los servicios afectados.
5. Volver a publicar el frontend en el `DocumentRoot` de Apache si cambió.
6. Probar inicio de sesión, rutas `/api/` y composición de datos.

Ejemplo:

```bash
sudo -u nodeapps git -C /srv/logired/app pull --ff-only
sudo systemctl restart ms-conductores
sudo rsync -av --delete /srv/logired/app/frontend/ /var/www/logired/
```

No usar `git pull` a ciegas si hay cambios locales sin confirmar; `--ff-only` evita fusiones automáticas, pero no sustituye la revisión del estado del repositorio.

## 13. Referencias internas y pendientes de verificación

- [ ] Añadir URL real del repositorio y enlaces a los commits de integración.
- [ ] Confirmar los endpoints de login y administración de usuarios de `ms-usuarios`.
- [ ] Confirmar nombres reales de variables de entorno y URLs internas de cada microservicio.
- [ ] Confirmar ubicación y contenido de cada `schema.sql`.
- [ ] Confirmar que los cinco servicios escuchen en `127.0.0.1`.
- [ ] Confirmar la ruta real del `DocumentRoot` y el procedimiento de publicación del frontend.
- [ ] Completar la columna «Resultado recibido» con las evidencias obtenidas.

**Nota:** los comandos son una guía de implementación para la topología documentada. Antes de aplicarlos sobre VMs ya configuradas, comparar con las configuraciones existentes y evitar sobrescribir usuarios, zonas DNS, bases de datos o VirtualHosts en funcionamiento.

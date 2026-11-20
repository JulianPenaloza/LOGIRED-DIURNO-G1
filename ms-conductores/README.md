# ms-conductores — LogiRed

**Entidad:** Conductor  
**Responsable:** José Criollo  
**Puerto interno:** `3004`  
**Versión del README:** actualización para el despliegue del Taller 3 (a partir del contrato 1.0.2)

## 1. Descripción

`ms-conductores` administra los conductores de LogiRed: registro, consulta, filtros, actualización y eliminación. Almacena la información en MySQL y permite consultas por lotes mediante `GET /conductores?ids=...`, utilizadas por `ms-vehiculos` para asociar los vehículos con sus conductores.

El servicio utiliza autenticación y autorización mediante JWT. En el despliegue de LogiRed, **no se expone directamente a Windows**: escucha en el puerto `3004` del servidor de aplicaciones y Apache publica sus rutas mediante el gateway `/api`.

## 2. Arquitectura de despliegue

| Componente | Máquina | Dirección | Acceso |
|---|---|---|---|
| DNS (`bind9`) | `ser1-cd-cali` | `172.24.0.134:53` | Clientes de la red privada |
| MySQL (`conductores_db`) | `ser1-cd-cali` | `172.24.0.134:3306` | Solo desde servidor2 |
| Apache (frontend y gateway) | `ser2-cd-cali` | `172.24.0.132:80` | Clientes de la red privada |
| `ms-conductores` | `ser2-cd-cali` | `127.0.0.1:3004` | Solo servidor2 y otros servicios locales |
| `ms-vehiculos` | `ser2-cd-cali` | `127.0.0.1:3005` | Solo servidor2 y gateway |

**URL pública a través del gateway:** `http://app.logired.com.co/api/conductores`  
**URL interna del microservicio:** `http://127.0.0.1:3004/conductores`

> Las rutas de Apache y el nombre de la unidad `systemd` que se muestran a continuación son la configuración propuesta para el proyecto. Si el repositorio o los archivos existentes usan otros nombres, deben ajustarse sin duplicar configuraciones.

## 3. Requisitos

- Dos máquinas virtuales Ubuntu conectadas a la red privada de LogiRed.
- En servidor1: MySQL Server, `bind9` y `ufw`.
- En servidor2: Node.js, npm, Apache2, módulos `proxy` y `proxy_http`, `ufw` y acceso al repositorio.
- Una cuenta de sistema para ejecutar aplicaciones Node.js (en este despliegue, `nodeapps`).
- Archivo `.env` con credenciales privadas y clave JWT compartida con el emisor de tokens.

## 4. Ejecución local (desarrollo)

```bash
git clone <URL_DEL_REPOSITORIO>
cd <DIRECTORIO_DEL_REPOSITORIO>/ms-conductores
npm install
cp .env.example .env
```

Editar `.env` con la configuración de la base de datos local y la clave JWT correspondiente. Si MySQL está en el mismo equipo, usar `DB_HOST=172.24.0.134`. Inicializar el esquema según las instrucciones de la sección 5 y ejecutar el script definido en `package.json`:

```bash
npm start
```

Si el proyecto usa otro script, comprobarlo con `npm run`. Para verificar la ejecución local:

```bash
curl http://127.0.0.1:3004/health
```

Ejemplo de respuesta esperada, según el contrato original:

```json
{"servicio":"ms-conductores","estado":"ok"}
```

## 5. Preparación de MySQL en servidor1 (`172.24.0.134`)

Los siguientes comandos se ejecutan **en servidor1**. Si MySQL ya fue configurado por el integrador de datos, revisar los archivos antes de modificarlos.

### 5.1. Instalar y habilitar MySQL

```bash
sudo apt update
sudo apt install -y mysql-server
sudo systemctl enable --now mysql
sudo systemctl status mysql
```

### 5.2. Permitir conexiones desde servidor2

Localizar el archivo de configuración activo, habitualmente `/etc/mysql/mysql.conf.d/mysqld.cnf`, y establecer:

```ini
[mysqld]
bind-address = 127.0.0.1,172.24.0.134
```

Aplicar los cambios:

```bash
sudo systemctl restart mysql
sudo ss -lntp | grep ':3306'
```

Permitir el puerto **solo desde servidor2**:

```bash
sudo ufw allow from 172.24.0.132 to any port 3306 proto tcp
sudo ufw status numbered
```

Si existe una regla anterior que abre `3306` a toda la red, revisarla y retirarla con cuidado. No abrir MySQL a Internet ni al host Windows.

### 5.3. Crear la base de datos y su usuario

Acceder al cliente de MySQL:

```bash
sudo mysql
```

Ejemplo de preparación. **Sustituir la contraseña de ejemplo por la credencial acordada por el grupo**; si el usuario ya existe, no sobrescribirlo sin coordinarlo:

```sql
CREATE DATABASE IF NOT EXISTS conductores_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'conductores_user'@'172.24.0.132'
  IDENTIFIED BY '<CLAVE_ACORDADA_POR_EL_GRUPO>';

GRANT SELECT, INSERT, UPDATE, DELETE
ON conductores_db.*
TO 'conductores_user'@'172.24.0.132';
```

El usuario de aplicación no necesita permisos globales ni permisos de creación de tablas. La importación inicial del esquema se realiza con una cuenta administrativa.

### 5.4. Importar el esquema

El README original hace referencia a `schema.sql`. Comprobar su ubicación real en el repositorio (por ejemplo, `ms-conductores/db/schema.sql`) y transferirlo a servidor1 si todavía no está allí. Luego ejecutar:

```bash
sudo mysql conductores_db < /ruta/real/al/schema.sql
```

**Importante:** si `schema.sql` contiene `CREATE DATABASE` o `USE`, revisar su contenido antes de importar; si contiene datos iniciales, evitar ejecutarlo repetidamente sobre una base de datos ya poblada.

Verificar:

```bash
sudo mysql -e 'SHOW TABLES FROM conductores_db;'
sudo mysql -e 'SELECT COUNT(*) AS total FROM conductores_db.conductores;'
```

## 6. Despliegue de la aplicación en servidor2 (`172.24.0.132`)

Los comandos de esta sección se ejecutan **en servidor2**.

### 6.1. Preparar Node.js y el usuario de servicio

Instalar una versión de Node.js compatible con el proyecto y comprobar:

```bash
node --version
npm --version
```

Crear el usuario de ejecución si aún no existe:

```bash
id nodeapps || sudo useradd --system --create-home --shell /usr/sbin/nologin nodeapps
```

Preparar el directorio de despliegue:

```bash
sudo mkdir -p /srv/logired/app
sudo chown -R "$USER":nodeapps /srv/logired/app
```

### 6.2. Obtener el código e instalar dependencias

Si el repositorio completo aún no está desplegado:

```bash
git clone <URL_DEL_REPOSITORIO> /srv/logired/app
```

Si ya está clonado, actualizarlo conforme al procedimiento acordado por el grupo, sin sobrescribir cambios locales ni archivos `.env`.

```bash
cd /srv/logired/app/ms-conductores
npm ci --omit=dev
```

`npm ci` requiere un `package-lock.json` válido. Si no existe, utilizar `npm install --omit=dev` y corregir el control de dependencias en el repositorio. Si aparece `Cannot find module 'cors'` u otro módulo, comprobar que la dependencia esté declarada en `package.json` e instalada.

### 6.3. Configurar las variables de entorno

Crear el archivo `.env` a partir del ejemplo y editarlo:

```bash
cd /srv/logired/app/ms-conductores
cp .env.example .env
nano .env
```

Ejemplo de configuración para las máquinas virtuales:

```dotenv
PORT=3004
DB_HOST=172.24.0.134
DB_PORT=3306
DB_NAME=conductores_db
DB_USER=conductores_user
DB_PASSWORD=<CLAVE_ACORDADA_POR_EL_GRUPO>
JWT_SECRET=<CLAVE_JWT_COMPARTIDA>
```

La clave `JWT_SECRET` debe coincidir con la utilizada por `ms-usuarios` para firmar los tokens y por los demás microservicios que los verifican. **No incluir claves reales en el README ni en commits**. Si se cambia la clave compartida, actualizarla de forma coordinada en los servicios correspondientes y emitir nuevos tokens.

Para impedir que el archivo de secretos sea legible por otros usuarios:

```bash
sudo chown nodeapps:nodeapps /srv/logired/app/ms-conductores/.env
sudo chmod 600 /srv/logired/app/ms-conductores/.env
```

**Escucha de red:** el proceso debe escuchar solo en `127.0.0.1:3004` para que no sea accesible desde Windows. Verificar cómo se define `app.listen(...)` en `src/index.js`; si la aplicación soporta una variable de host, establecer `HOST=127.0.0.1`. Si no la soporta, adaptar el código para usar el host local antes del despliegue.

### 6.4. Crear el servicio `systemd`

Crear `/etc/systemd/system/ms-conductores.service`:

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
ExecStart=/usr/bin/node --env-file=.env src/index.js
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Esta unidad usa la opción nativa `--env-file` de Node.js, por lo que requiere una versión compatible. Confirmar la ruta con `command -v node`; si no es `/usr/bin/node`, corregir `ExecStart`. Evitar cargar el mismo archivo de entorno de forma innecesaria con dos mecanismos distintos.

Dar acceso al código a `nodeapps` (sin exponer secretos):

```bash
sudo chown -R nodeapps:nodeapps /srv/logired/app/ms-conductores
sudo systemctl daemon-reload
sudo systemctl enable --now ms-conductores
sudo systemctl status ms-conductores
```

Consultar registros:

```bash
sudo journalctl -u ms-conductores -n 80 --no-pager
sudo journalctl -u ms-conductores -f
```

Verificar el puerto y el endpoint de salud desde servidor2:

```bash
sudo ss -lntp | grep ':3004'
curl -i http://127.0.0.1:3004/health
```

El socket debería mostrar `127.0.0.1:3004`, **no** `0.0.0.0:3004`.

## 7. Gateway de Apache en servidor2

Apache recibe las peticiones del navegador y las reenvía al microservicio local. No es necesario que el navegador acceda al puerto `3004`.

### 7.1. Habilitar los módulos necesarios

```bash
sudo a2enmod proxy proxy_http headers
sudo apache2ctl configtest
```

### 7.2. Configurar la ruta `/api/conductores`

En el `VirtualHost` de `app.logired.com.co`, agregar o comprobar las reglas siguientes **antes de reglas proxy genéricas que puedan interceptarlas**:

```apache
ServerName app.logired.com.co

ProxyPass        "/api/conductores" "http://127.0.0.1:3004/conductores"
ProxyPassReverse "/api/conductores" "http://127.0.0.1:3004/conductores"
```

No crear otro `VirtualHost` con el mismo nombre si ya existe uno configurado. Conservar las demás rutas del gateway (`/api/usuarios`, `/api/clientes`, `/api/envios` y `/api/vehiculos`) y el `DocumentRoot` del frontend.

Comprobar y recargar:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Desde Windows, verificar el DNS:

```powershell
nslookup app.logired.com.co
```

El registro debe resolver a `172.24.0.132`. Para evitar interferencias del proxy configurado en Windows, las pruebas con `curl.exe` pueden utilizar `--noproxy "*"`.

### 7.3. Frontend servido por Apache

El frontend debe estar en el directorio definido por `DocumentRoot` en el sitio de Apache. **Los archivos del repositorio no se publican automáticamente** si Apache sirve otra carpeta. Después de actualizar el frontend en `/srv/logired/app/frontend`, copiar o sincronizar su contenido al directorio público real.

Antes de copiar, identificar la ruta correcta:

```bash
sudo apache2ctl -S
grep -R 'DocumentRoot' /etc/apache2/sites-enabled/
```

Ejemplo, **solo si el `DocumentRoot` real es `/var/www/html`**:

```bash
sudo rsync -av --delete /srv/logired/app/frontend/ /var/www/html/
```

`--delete` elimina del destino los archivos que no están en el origen; usarlo únicamente cuando el directorio de destino esté dedicado por completo a ese frontend. Si Apache sirve otras páginas, sincronizar a un subdirectorio específico sin `--delete`.

Verificar el contenido servido por Apache y recargar la página del navegador evitando caché. Si los cambios del código no aparecen, comprobar primero que el archivo actualizado esté en el `DocumentRoot` correcto.

## 8. Contrato REST

Todas las rutas internas usan el prefijo `/conductores`. Para clientes externos se añade `/api` a través del gateway.

| Operación | Método | Ruta interna | Ruta mediante gateway | Éxito | Errores del contrato original |
|---|---|---|---|---|---|
| Listar | GET | `/conductores` | `/api/conductores` | 200 | 500 |
| Filtrar | GET | `/conductores?categoria_licencia=C2&sede=cali` | `/api/conductores?categoria_licencia=C2&sede=cali` | 200 | 500 |
| Consultar por lotes | GET | `/conductores?ids=1,2,3` | `/api/conductores?ids=1,2,3` | 200 | 400, 500 |
| Obtener | GET | `/conductores/:id` | `/api/conductores/:id` | 200 | 400, 404, 500 |
| Crear | POST | `/conductores` | `/api/conductores` | 201 | 400, 409, 500 |
| Actualizar | PUT | `/conductores/:id` | `/api/conductores/:id` | 200 | 400, 404, 409, 500 |
| Eliminar | DELETE | `/conductores/:id` | `/api/conductores/:id` | 204 | 400, 404, 500 |

**Seguridad:** el middleware `verificarToken` valida el JWT y `requiereRol` comprueba los permisos. Las rutas protegidas deben devolver `401` cuando no hay token válido y `403` cuando el rol no tiene permiso. **Los permisos exactos por operación deben verificarse en las rutas del código**, ya que el README original no contiene una matriz completa de roles.

### 8.1. Representación de un conductor

```json
{
  "id": 1,
  "nombre": "Carlos Rodríguez",
  "cedula": "1110365790",
  "categoria_licencia": "C2",
  "telefono": "3001234567",
  "sede": "cali"
}
```

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---|---|
| `id` | Entero | No | Autogenerado por MySQL, único y positivo |
| `nombre` | Texto | Sí | No vacío; se recortan espacios al inicio y final |
| `cedula` | Texto | Sí | Exactamente 10 dígitos; única |
| `categoria_licencia` | Texto | Sí | C2 o C3 |
| `telefono` | Texto | Sí | De 7 a 10 dígitos; único |
| `sede` | Texto | Sí | cali, medellin o bogota |

**Nota de compatibilidad:** el README original muestra licencias `C2` y `C3`; si el código normaliza internamente a minúsculas, comprobar el formato real de entrada y salida antes de cambiar el contrato publicado.

### 8.2. Ejemplo de creación mediante el gateway

```http
POST http://app.logired.com.co/api/conductores
Authorization: Bearer <TOKEN_JWT_VALIDO>
Content-Type: application/json
```

```json
{
  "nombre": "Andrés Castillo",
  "cedula": "1110365999",
  "categoria_licencia": "C2",
  "telefono": "3004567890",
  "sede": "bogota"
}
```

Respuesta de ejemplo (`201 Created`):

```json
{
  "id": 15,
  "nombre": "Andrés Castillo",
  "cedula": "1110365999",
  "categoria_licencia": "C2",
  "telefono": "3004567890",
  "sede": "bogota"
}
```

El contrato original documenta `Location: /conductores/15`. Detrás del gateway, comprobar cómo se publica esta cabecera y si es necesario exponer la ruta `/api/conductores/15` para clientes externos.

### 8.3. Consultas y filtros

```http
GET /api/conductores
GET /api/conductores/1
GET /api/conductores?categoria_licencia=C2&sede=cali
GET /api/conductores?ids=1,2,3
```

El parámetro `ids` permite recuperar varios conductores en una sola solicitud. Los identificadores inválidos generan `400`; los IDs inexistentes pueden simplemente no aparecer en el arreglo devuelto.

### 8.4. Errores

El servicio utiliza un objeto JSON con `error` y, cuando corresponde, `detalles`.

Ejemplo de validación (`400`):

```json
{
  "error": "Datos inválidos",
  "detalles": ["nombre es obligatorio", "cedula es obligatoria y debe tener un formato válido"]
}
```

Ejemplo de duplicidad (`409`):

```json
{
  "error": "Ya existe un conductor con la cédula 1110365790",
  "detalles": null
}
```

## 9. Reglas de negocio y persistencia

- La cédula y el teléfono son únicos.
- En una actualización, un conductor puede conservar su propia cédula y teléfono, pero no utilizar los de otro registro.
- Los datos inválidos generan `400`, los recursos inexistentes `404` y los duplicados `409`, conforme al contrato.
- Los datos se guardan en la tabla `conductores` de `conductores_db`.
- La capa de repositorio centraliza el acceso a MySQL mediante un pool de conexiones y consultas parametrizadas.

Funciones del repositorio documentadas originalmente: `findAll`, `findById`, `findByCedula`, `findByCelular`, `create`, `update` y `remove`.

## 10. Integración con `ms-vehiculos`

| Servicio consumidor | Uso | Ruta interna de `ms-conductores` | Datos relevantes |
|---|---|---|---|
| `ms-vehiculos` | Validar un conductor al crear o actualizar un vehículo | `GET /conductores/:id` | Existencia del conductor |
| `ms-vehiculos` | Componer el listado de vehículos con sus conductores | `GET /conductores?ids=...` | id, nombre, cédula, licencia, teléfono, sede |

Ambos servicios están en servidor2, por lo que `ms-vehiculos` puede consultar a `ms-conductores` mediante `http://127.0.0.1:3004`. **No debe depender del DNS público ni del gateway para estas llamadas internas**, salvo que la implementación del grupo establezca expresamente otra arquitectura.

Para comprobar la consulta por lotes:

1. Asegurar que existan vehículos con `conductor_id` válido.
2. En servidor2, abrir `sudo journalctl -u ms-conductores -f`.
3. Desde Windows, iniciar sesión y abrir el listado de vehículos del frontend.
4. Comprobar que se visualice la información relacionada y que llegue una sola solicitud `GET /conductores?ids=...`.

Si `journalctl` no muestra las peticiones HTTP, puede agregarse temporalmente un middleware de registro **antes de las rutas**:

```javascript
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});
```

Después de modificar el código, reiniciar `ms-conductores`. No registrar tokens ni contraseñas.

## 11. Pruebas de despliegue y seguridad

### 11.1. Verificar el gateway desde Windows

En Postman, utilizar la base `http://app.logired.com.co/api` y autenticación `Bearer <TOKEN_JWT_VALIDO>` cuando la ruta lo requiera. Ejecutar las colecciones con los códigos esperados.

Ejemplo de prueba sin token:

```powershell
curl.exe --noproxy "*" -i http://app.logired.com.co/api/conductores
```

**Resultado esperado:** `401` si el endpoint está protegido por `verificarToken`.

### 11.2. Comprobar aislamiento de puertos desde Windows

```powershell
curl.exe --noproxy "*" --connect-timeout 5 http://172.24.0.132:3004/health
Test-NetConnection 172.24.0.134 -Port 3306
```

**Resultado esperado:** la conexión directa al puerto `3004` no funciona y `TcpTestSucceeded` para MySQL es `False`. Esto no impide el acceso legítimo por Apache ni desde servidor2 a MySQL.

### 11.3. Comprobar inicio automático

En servidor2:

```bash
systemctl is-enabled apache2 ms-conductores
systemctl is-active apache2 ms-conductores
```

Para comprobar todos los microservicios:

```bash
systemctl is-enabled ms-usuarios ms-clientes ms-envios ms-conductores ms-vehiculos
```

Después de reiniciar servidor2, verificar que los servicios vuelvan a estar activos y que el frontend pueda consultar los datos.

## 12. Diagnóstico de problemas frecuentes

| Síntoma | Posible causa | Comprobación |
|---|---|---|
| `ms-conductores` no inicia | Dependencia faltante o error de Node.js | `sudo journalctl -u ms-conductores -n 80 --no-pager` |
| `Cannot find module 'cors'` | Dependencias no instaladas o no declaradas | Revisar `package.json` y ejecutar `npm ci --omit=dev` |
| Error de conexión MySQL | Host, credenciales, permisos o UFW incorrectos | Revisar `.env`, `bind-address`, reglas de `ufw` y usuario MySQL |
| `502` desde Apache | Servicio detenido o `ProxyPass` incorrecto | `systemctl status ms-conductores`, `apache2ctl configtest` y logs de Apache |
| `401` | Token ausente, vencido o inválido | Verificar `Authorization: Bearer ...` y clave JWT compartida |
| `403` | Rol sin permiso | Revisar `requiereRol` y el rol del token |
| Los cambios del frontend no aparecen | Archivos del repositorio distintos a los publicados por Apache | Comprobar `DocumentRoot`, copia de archivos y caché del navegador |
| El listado de vehículos no incluye conductores | Consulta interna o composición de datos fallida | Revisar logs de `ms-vehiculos` y `ms-conductores` |

Comandos de diagnóstico:

```bash
sudo journalctl -u ms-conductores -f
sudo tail -f /var/log/apache2/error.log
sudo apache2ctl configtest
sudo ss -lntp | grep -E ':80|:3004'
```

## 13. Evidencias recomendadas para el Taller 3

- `nslookup app.logired.com.co` desde Windows mostrando `172.24.0.132`.
- `systemctl status ms-conductores` mostrando el servicio activo.
- Pruebas de Postman a través de `/api/conductores` con resultados `200`, `201`, `400`, `401`, `403`, `404` y `409`, según corresponda.
- Captura del frontend mostrando vehículos con datos de sus conductores y registro de una consulta por lotes `?ids=`.
- Prueba de aislamiento del puerto `3004` y de MySQL `3306` desde Windows.
- Verificación de recuperación automática tras reiniciar servidor2.

## 14. Consideraciones de seguridad y mantenimiento

- Mantener `.env` fuera de Git; utilizar `.env.example` sin secretos reales.
- No abrir los puertos de microservicios ni MySQL al host Windows o a Internet.
- Mantener el secreto JWT consistente entre emisor y verificadores y rotarlo coordinadamente.
- Usar usuarios de MySQL independientes y permisos limitados por base de datos.
- Reiniciar el servicio correspondiente después de actualizar código o variables de entorno.
- Confirmar que Apache publica la misma versión del frontend que se pretende desplegar.
- No asumir que una prueba ha pasado hasta comprobar su resultado real.

---

**Pendiente de completar con datos del repositorio:** URL real, ubicación exacta de `schema.sql`, scripts definitivos de `package.json`, matriz de permisos por rol y ruta definitiva del `DocumentRoot` del frontend. Estas partes deben contrastarse con la implementación antes de utilizar el documento como procedimiento automatizado.

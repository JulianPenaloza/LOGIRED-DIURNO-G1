# ms-clientes · Microservicio de clientes de LogiRed

Microservicio de **clientes** de LogiRed S.A.S. (personas o empresas que envían paquetes),
con **Node.js + Express** organizado en capas, datos en **MySQL** y acceso protegido con
**tokens JWT**.

- **Entidad:** Cliente
- **Responsable:** Jesús David Albarracín Ortega (`jesusalba15`)
- **Puerto:** 3002
- **Base de datos:** `clientes_db` (exclusiva de este microservicio)

ms-envios consulta este servicio por REST para validar y mostrar los datos del cliente
de cada envío (ver la sección Relaciones).

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`) y MySQL Server 8.

**1. Crear la base de datos y su usuario** (en Workbench o en la consola de MySQL, como `root`):

```sql
CREATE DATABASE clientes_db;
CREATE USER 'clientes_user'@'localhost' IDENTIFIED BY 'clave';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'localhost';
```

**2. Crear la tabla y los 3 clientes iniciales.** Seleccione `clientes_db` y ejecute el
contenido de `db/schema.sql`.

**3. Instalar y configurar:**

```
npm install                 # descarga las dependencias en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
```

Abra el `.env` y escriba la clave que eligió en el paso 1 (`DB_PASSWORD`) y la
`JWT_SECRET` del grupo (la misma frase que usa ms-usuarios).

**4. Iniciar:**

```
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Debe aparecer `ms-clientes escuchando en http://127.0.0.1:3002`. Pruebe en el navegador
http://127.0.0.1:3002/health (público). Para consultar `/clientes` necesita un token
(ver la sección Seguridad).

### Variables del `.env`

| Variable | Qué es | Valor de ejemplo |
|---|---|---|
| PORT | Puerto donde escucha el servicio | 3002 |
| HOST | Dirección donde escucha (solo este equipo) | 127.0.0.1 |
| DB_HOST | Equipo donde corre MySQL | localhost |
| DB_PORT | Puerto de MySQL | 3306 |
| DB_NAME | Base de datos de este microservicio | clientes_db |
| DB_USER | Usuario de la base | clientes_user |
| DB_PASSWORD | Clave del usuario (no se sube al repositorio) | |
| JWT_SECRET | Clave con la que se verifican los tokens. Debe ser la misma en todos los microservicios del grupo y en ms-usuarios (no se sube al repositorio) | |

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, registro de peticiones, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador, con los permisos por rol |
| src/middlewares/auth.js | Seguridad | Verifica el token (401) y el rol (403); copia sin cambios de ms-usuarios |
| src/controllers/clientes.controller.js | Presentación | Lee la petición (id, filtros, cuerpo), llama al servicio, arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y reglas (documento único); no conoce HTTP ni la base de datos |
| src/models/clientes.js | Modelo | Atributos de la entidad y su validación |
| src/repositories/clientes.repository.js | Acceso a datos | Consultas SQL parametrizadas a `clientes_db` |
| src/db.js | Acceso a datos | Pool de conexiones a MySQL con los datos del `.env` |
| db/schema.sql | Base de datos | Tabla `clientes` y 3 clientes iniciales |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Representación de un cliente

Así responde `GET /clientes/1`. Es la forma de cada cliente en todas las respuestas:

```json
{
  "id": 1,
  "nombre": "Distribuidora El Valle",
  "documento": "900123456",
  "telefono": "3001112233",
  "email": "contacto@elvalle.com",
  "ciudad": "Cali"
}
```

## Atributos

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna la base de datos) | Positivo y único; el cliente nunca lo envía |
| nombre | texto | Sí | No vacío; se guarda sin espacios al inicio ni al final |
| documento | texto | Sí | De 6 a 15 dígitos; único (si se repite: 409) |
| telefono | texto | Sí | De 7 a 10 dígitos |
| email | texto | Sí | Formato de correo válido; se guarda en minúsculas |
| ciudad | texto | Sí | No vacía |

`documento` y `telefono` son texto (van entre comillas en el JSON) para no perder ceros
iniciales. Los campos que no estén en la tabla se descartan.

## Endpoints

| Operación | Método | URI | Quién | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|---|
| Salud | GET | /health | Público | — | 200 `{"servicio":"ms-clientes","estado":"ok"}` | — |
| Listar | GET | /clientes | Cualquier rol | — | 200 + arreglo | 401 |
| Filtrar | GET | /clientes?ciudad=Cali | Cualquier rol | — | 200 + arreglo filtrado | 401 |
| Consultar por lotes | GET | /clientes?ids=1,3,8 | Cualquier rol | — | 200 + arreglo con esos registros | 400 · 401 |
| Obtener | GET | /clientes/:id | Cualquier rol | — | 200 + objeto | 400 · 401 · 404 |
| Crear | POST | /clientes | administrador, despacho | JSON sin id | 201 + objeto + cabecera Location | 400 · 401 · 403 · 409 |
| Actualizar | PUT | /clientes/:id | administrador, despacho | JSON completo sin id | 200 + objeto actualizado | 400 · 401 · 403 · 404 · 409 |
| Eliminar | DELETE | /clientes/:id | administrador, despacho | — | 204 sin cuerpo | 400 · 401 · 403 · 404 |

Notas sobre los filtros:

- `ids` es una lista de enteros positivos separados por comas. Un id que no existe no es
  error: simplemente no aparece en el arreglo. Si algún valor no es un entero positivo
  (por ejemplo `?ids=abc` o `?ids=`), responde 400.
- `ciudad` filtra por la ciudad indicada. Se pueden combinar `ciudad` e `ids`.

### Ejemplo: crear un cliente

`POST /clientes` con `Content-Type: application/json` y la cabecera
`Authorization: Bearer <token>` (rol administrador o despacho):

```json
{
  "nombre": "Transportes Pacífico",
  "documento": "900456783",
  "telefono": "3004445566",
  "email": "info@pacifico.com",
  "ciudad": "Buenaventura"
}
```

Respuesta `201 Created`, con la cabecera `Location: /clientes/6`:

```json
{
  "id": 6,
  "nombre": "Transportes Pacífico",
  "documento": "900456783",
  "telefono": "3004445566",
  "email": "info@pacifico.com",
  "ciudad": "Buenaventura"
}
```

### Ejemplo: listar clientes

`GET /clientes?ids=1,3` con la cabecera `Authorization: Bearer <token>` responde `200 OK`:

```json
[
  {
    "id": 1,
    "nombre": "Distribuidora El Valle",
    "documento": "900123456",
    "telefono": "3001112233",
    "email": "contacto@elvalle.com",
    "ciudad": "Cali"
  },
  {
    "id": 3,
    "nombre": "Tienda La Esquina",
    "documento": "900345678",
    "telefono": "3003334455",
    "email": "info@laesquina.com",
    "ciudad": "Medellín"
  }
]
```

### Formato de los errores

Todos los errores tienen el mismo formato (la lista `detalles` aparece solo en los errores
de validación):

```json
{
  "error": "Datos inválidos",
  "detalles": ["nombre es obligatorio"]
}
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, id inválido o lista `ids` inválida |
| 401 | Falta el token, es inválido o venció |
| 403 | El rol del token no tiene permiso para esa operación |
| 404 | El cliente no existe |
| 409 | El documento ya pertenece a otro cliente |

## Seguridad

Todos los endpoints de `/clientes` exigen un token JWT en la cabecera
`Authorization: Bearer <token>`. Este servicio solo **verifica** tokens; los emite
ms-usuarios con `POST /usuarios/login`. `/health` es público.

- Sin token, con un token modificado o vencido: **401**.
- Con un token válido pero de un rol sin permiso para la operación: **403**.

| Operación | Roles permitidos |
|---|---|
| Consultar (GET) | Cualquier rol autenticado (administrador, despacho, flota) |
| Crear, modificar, eliminar (POST, PUT, DELETE) | administrador, despacho |

El token lleva `{ id, nombre, rol }` y se verifica con `JWT_SECRET`. Si la clave de este
servicio no es idéntica a la de ms-usuarios, todos los tokens se rechazan con 401.

Cada petición que llega se registra en la terminal con la hora, el método y la URI.

## Relaciones

ms-clientes **no guarda referencias** a otros microservicios. Es un servicio consultado:
ms-envios guarda el `cliente_id` de cada envío y le pide a este servicio los datos del cliente.

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-envios | `GET /clientes/:id` (al crear o actualizar un envío, solo usa el código 200 o 404) · `GET /clientes?ids=…` (al consultar envíos) | id, nombre, ciudad |

ms-envios debe reenviar en cada consulta el token que recibió del usuario (cabecera
`Authorization`), porque este servicio también lo exige: sin token responde 401.

Cualquier cambio en el nombre de estos campos o en estas URIs rompe ms-envios, por eso se
avisa al grupo antes de hacerlo.
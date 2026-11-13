# ms-conductores

**Entidad:** Conductor  
**Responsable:** José Criollo  
**Puerto:** 3004  
**Versión:** 1.0.2

## 1. Descripción

El microservicio `ms-conductores` administra la información de los conductores de LogiRed. Permite registrar, consultar, filtrar, actualizar y eliminar conductores, manteniendo la integridad de sus datos mediante validaciones de negocio.

La información se almacena de manera persistente en una base de datos MySQL. El servicio también permite consultar varios conductores mediante sus identificadores, facilitando la comunicación con otros microservicios que necesitan relacionar vehículos con sus respectivos conductores.

## 2. Ejecución del microservicio

### Requisitos

- Node.js.
- npm.
- MySQL Server.
- Base de datos MySQL disponible.
- Acceso al repositorio del proyecto.

### Instalación

Clonar el repositorio y acceder al directorio del microservicio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd ms-conductores
```

Instalar las dependencias:

```bash
npm install
```

### Configuración de variables de entorno

Crear un archivo `.env` a partir de `.env.example`:

```env
PORT=3004

DB_HOST=localhost
DB_PORT=3306
DB_NAME=conductores_db
DB_USER=conductores_user
DB_PASSWORD=clave-segura

JWT_SECRET=clave_compartida_entre_microservicios
```

Las variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD` permiten configurar la conexión a MySQL.

`JWT_SECRET` debe coincidir con la clave utilizada por el servicio que emite los tokens JWT, si las rutas requieren autenticación.

**Importante:** utilizar credenciales reales en `.env` y no subir este archivo al repositorio. `.env.example` debe contener únicamente valores de ejemplo.

### Creación de la base de datos

Crear la base de datos y el usuario con los permisos correspondientes en MySQL. Después, ejecutar el archivo de estructura:

```bash
mysql -u root -p < schema.sql
```

El archivo `schema.sql` contiene las instrucciones necesarias para crear la tabla `conductores` e incorporar los datos iniciales definidos para el entorno de desarrollo.

Si el esquema crea también la base de datos, debe ejecutarse con un usuario que tenga los permisos correspondientes.

### Ejecución

Iniciar el microservicio utilizando el script definido en `package.json`.

Por ejemplo, si está configurado el script `start`:

```bash
npm start
```

El servicio estará disponible en:

```text
http://localhost:3004
```

Para comprobar su funcionamiento:

```http
GET http://localhost:3004/health
```

Respuesta esperada:

```json
{
  "servicio": "ms-conductores",
  "estado": "ok"
}
```

## 3. Representación de un conductor

Cada conductor se representa mediante la siguiente estructura JSON:

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

### 3.1. Atributos

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---|---|
| id | Entero | No | Lo genera automáticamente MySQL. Es único y positivo. |
| nombre | Texto | Sí | No puede estar vacío. Se eliminan espacios al inicio y al final. |
| cedula | Texto | Sí | Exactamente 10 dígitos numéricos. Debe ser única. |
| categoria_licencia | Texto | Sí | Valores permitidos: C2, C3. |
| telefono | Texto | Sí | Entre 7 y 10 dígitos numéricos. Debe ser único. |
| sede | Texto | Sí | Valores permitidos: cali, medellin, bogota. |

Los campos que no pertenecen a la estructura de la entidad no se incorporan al objeto construido por el modelo.

## 4. Diseño REST de la API

Todas las rutas del recurso utilizan el prefijo `/conductores`.

| Operación | Método | URI | Cuerpo | Respuesta exitosa | Errores posibles |
|---|---|---|---|---|---|
| Listar | GET | `/conductores` | No requiere | 200: arreglo de conductores | 500 |
| Filtrar | GET | `/conductores?categoria_licencia=C2&sede=cali` | No requiere | 200: arreglo filtrado | 500 |
| Consultar por lotes | GET | `/conductores?ids=1,2,3` | No requiere | 200: arreglo de conductores encontrados | 400: IDs inválidos. 500 |
| Obtener | GET | `/conductores/:id` | No requiere | 200: objeto de conductor | 400: ID inválido. 404: inexistente. 500 |
| Crear | POST | `/conductores` | JSON del conductor | 201: conductor creado | 400: datos inválidos. 409: datos duplicados. 500 |
| Actualizar | PUT | `/conductores/:id` | JSON completo del conductor | 200: conductor actualizado | 400: datos inválidos. 404: inexistente. 409: datos duplicados. 500 |
| Eliminar | DELETE | `/conductores/:id` | No requiere | 204: sin contenido | 400: ID inválido. 404: inexistente. 500 |

### 4.1. Ejemplo de creación

**Petición:**

```http
POST /conductores
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

**Respuesta: 201 Created**

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

El servicio también devuelve la cabecera `Location`, que identifica la URI del nuevo conductor:

```http
Location: /conductores/15
```

### 4.2. Ejemplo de listado

**Petición:**

```http
GET /conductores
```

**Respuesta: 200 OK**

```json
[
  {
    "id": 1,
    "nombre": "Carlos Rodríguez",
    "cedula": "1110365790",
    "categoria_licencia": "C2",
    "telefono": "3001234567",
    "sede": "cali"
  },
  {
    "id": 2,
    "nombre": "Andrés Castillo",
    "cedula": "1110365999",
    "categoria_licencia": "C3",
    "telefono": "3004567890",
    "sede": "bogota"
  }
]
```

### 4.3. Ejemplo de consulta por lotes

**Petición:**

```http
GET /conductores?ids=1,2,3
```

El servicio devuelve un arreglo con los conductores encontrados. Los identificadores inexistentes no generan necesariamente un error individual.

### 4.4. Formato de errores

Las respuestas de error utilizan un objeto JSON con el atributo `error` y, cuando corresponde, `detalles`.

Ejemplo de datos inválidos:

```json
{
  "error": "Datos inválidos",
  "detalles": [
    "nombre es obligatorio",
    "cedula es obligatoria y debe tener un formato válido"
  ]
}
```

Ejemplo de conflicto por duplicidad:

```json
{
  "error": "Ya existe un conductor con la cédula 1110365790",
  "detalles": null
}
```

### 4.5. Seguridad

El microservicio dispone de middleware de autenticación y autorización mediante JWT.

- `verificarToken`: comprueba la firma y vigencia del token recibido en la cabecera `Authorization`.
- `requiereRol`: restringe el acceso según los roles autorizados para cada operación.

Cada microservicio verifica los tokens utilizando la variable de entorno `JWT_SECRET`, sin consultar directamente a `ms-usuarios` en cada petición.

## 5. Reglas de negocio

### Unicidad de identificación y contacto

No pueden existir dos conductores registrados con la misma cédula ni con el mismo número de teléfono. Esta regla se verifica durante la creación y actualización de registros. En las actualizaciones, se permite conservar los datos del propio conductor, pero no utilizar los que pertenecen a otro registro. Esta validación permite mantener la identificación individual de los conductores, evitar duplicidades en la información de LogiRed y garantizar que los demás microservicios puedan identificar correctamente a la persona asociada a cada operación logística.

## 6. Relaciones con otros microservicios

El microservicio `ms-conductores` administra la información de los conductores y proporciona datos a otros servicios que necesitan asociarlos con sus respectivas operaciones.

### 6.1. Relaciones desde el lado consumidor

| Atributo o referencia | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos utilizados |
|---|---|---|---|---|
| conductor_id | ms-conductores | GET `/conductores/:id` | GET `/conductores?ids=…` | id, nombre, categoria_licencia, telefono, sede |

El microservicio `ms-vehiculos` utiliza esta relación para asociar un vehículo con un conductor registrado y recuperar sus datos cuando necesita presentar información de la flota.

### 6.2. Relaciones desde el lado consultado

| Me consulta | Peticiones que me hace | Campos que no puedo cambiar sin avisar |
|---|---|---|
| ms-vehiculos | GET `/conductores/:id` · GET `/conductores?ids=…` | id, nombre, cedula, categoria_licencia, telefono, sede |

El microservicio `ms-conductores` debe mantener estable la estructura de respuesta de su API para que `ms-vehiculos` pueda continuar identificando conductores, validando sus referencias y componiendo la información de los vehículos asociados.

**Nota:** las relaciones documentadas deben contrastarse con el diagrama de comunicación del Taller 1 y con la implementación de `ms-vehiculos`.

## 7. Persistencia de datos

La información se almacena en MySQL, utilizando una tabla denominada `conductores`.

El repositorio centraliza las operaciones de acceso a datos mediante un pool de conexiones, evitando que la capa de servicio tenga que conocer los detalles de la base de datos.

Las operaciones disponibles son:

- `findAll`: consulta y filtra conductores.
- `findById`: busca un conductor por identificador.
- `findByCedula`: busca por cédula.
- `findByCelular`: busca por teléfono.
- `create`: registra un conductor.
- `update`: actualiza un conductor.
- `remove`: elimina un conductor.

La migración a MySQL reemplazó el almacenamiento temporal en memoria por persistencia, conservando las responsabilidades de las demás capas.


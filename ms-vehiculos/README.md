# ms-vehiculos — Microservicio de vehículos

Proyecto del Taller 1 del Módulo 3 de Redes y Servicios Multimedia, Universidad Autónoma de Occidente (UAO).

Este microservicio administra los vehículos de LogiRed S.A.S. Está desarrollado con Node.js y Express y organizado mediante una arquitectura por capas.

## Funcionalidades

- Consultar el estado del servicio.
- Listar los vehículos registrados.
- Consultar un vehículo por su ID.
- Registrar vehículos nuevos.
- Validar los datos de entrada.
- Evitar el registro de placas duplicadas.

## Modelo de vehículo

Cada vehículo contiene los siguientes atributos:

- `id`: identificador único.
- `placa`: placa del vehículo.
- `tipo`: `moto`, `furgon` o `camion`.
- `capacidad_kg`: capacidad de carga en kilogramos.
- `estado`: `disponible`, `en_ruta` o `mantenimiento`.
- `conductor_id`: identificador del conductor asociado o `null`.

## Requisitos

- Node.js 22 o superior.
- npm.

## Cómo ejecutar el proyecto

Desde la terminal, entra en la carpeta `ms-vehiculos` y ejecuta:

```bash
npm install
npm run dev
```

El archivo `.env` debe contener la configuración local del servicio. Durante las pruebas actuales se utiliza el puerto `3001`; este puerto es provisional y debe ajustarse cuando se defina el puerto asignado al microservicio.

## Endpoints

| Método | Ruta | Función |
|---|---|---|
| GET | `/health` | Consultar el estado del servicio |
| GET | `/vehiculos` | Listar los vehículos |
| GET | `/vehiculos/:id` | Consultar un vehículo por ID |
| POST | `/vehiculos` | Registrar un vehículo |

## Ejemplo de registro

Enviar una petición `POST` a `/vehiculos` con el siguiente cuerpo JSON:

```json
{
  "placa": "ABC123",
  "tipo": "furgon",
  "capacidad_kg": 1500,
  "estado": "disponible",
  "conductor_id": null
}
```

Una creación exitosa devuelve el código HTTP `201 Created`.

## Arquitectura por capas

- **Routes:** define las rutas HTTP.
- **Controllers:** recibe las peticiones y construye las respuestas.
- **Services:** contiene las reglas de negocio y validaciones.
- **Repositories:** administra los datos en memoria.
- **Models:** define y valida la estructura del vehículo.
- **App:** configura Express, las rutas y el manejo de errores.
- **Index:** inicia el servidor.

## Almacenamiento

En esta etapa los datos se almacenan en memoria. Por lo tanto, los vehículos creados mediante peticiones se pierden al reiniciar el servidor. La persistencia en MySQL corresponde a una etapa posterior del proyecto.

## Pruebas

Las peticiones pueden probarse con Postman usando la dirección local:

`http://localhost:3001`

Recuerda sustituir el puerto provisional cuando el grupo defina el puerto definitivo.

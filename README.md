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
* `ms-usuarios/`: Entregado por la docente (nadie lo modifica).
* `ms-clientes/`: Gestión de clientes de la empresa.
* `ms-envios/`: Gestión y seguimiento de envíos (guías, origen, destino y estado).
* `ms-conductores/`: Gestión del personal de conducción.
* `ms-vehiculos/`: Gestión de la flota de transporte.

## Relaciones

`ms-envios` guarda la referencia de los clientes (`cliente_id`) y se comunica de forma síncrona con `ms-clientes` para validar su existencia y componer los datos en las consultas.

| Atributo | Microservicio consultado | Para validar (al crear y actualizar) | Para componer (al consultar) | Datos que usa |
| :--- | :--- | :--- | :--- | :--- |
| `cliente_id` | `ms-clientes` | `GET /clientes/:id` | `GET /clientes?ids=...` | id, nombre, ciudad |

`ms-envios` reenvía el token JWT recibido del usuario en cada petición hacia `ms-clientes` para cumplir con los requisitos de seguridad de ambos servicios.
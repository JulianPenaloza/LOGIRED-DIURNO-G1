# LOGIRED-DIURNO-G1
Aplicación web de logística y mensajería para gestionar clientes, envíos, conductores y vehículos.

## Integrantes
* Jesús David Albarracin Ortega - GitHub: jesusalba15 - Microservicio: ms-clientes
* José Andrés Criollo Echeverri - GitHub: jose2231411 - Microservicio: ms-conductores
* Julian Jair Peñaloza Chavarriaga - GitHub: JulianPenaloza - Microservicio: ms-envios
* Bryan Andrés Peñaranda Soto - GitHub: Bryan25062002 - Microservicio: ms-vehiculos

## Tabla de Microservicios
| Carpeta | Entidad | Responsable | Puerto | Depende de |
|---|---|---|---|---|
| ms-usuarios | Usuarios | Docente | 3001 | Ninguno |
| ms-clientes | Clientes | Jesus Albarracin | 3002 | Ninguno |
| ms-envios | Envíos | Julian Peñaloza | 3003 | ms-clientes |
| ms-conductores | Conductores | Jose Criollo | 3004 | Ninguno |
| ms-vehiculos | Vehículos | Bryan Peñaranda | 3005 | ms-conductores |

## Estructura del repositorio
* `README.md`: Información de la empresa, integrantes y tabla de microservicios.
* `ms-usuarios/`: Microservicio base entregado por la docente (nadie lo modifica).
* `ms-clientes/`: Microservicio de clientes.
* `ms-envios/`: Microservicio de envíos.
* `ms-conductores/`: Microservicio de conductores.
* `ms-vehiculos/`: Microservicio de vehículos.

## Cómo ejecutar un microservicio
Para probar cualquier microservicio en tu computador, entra a su carpeta desde la terminal y ejecuta:
1. `npm install` (Descarga las dependencias)
2. Copiar el archivo `.env.example` y renombrarlo a `.env` (Configurar variables)
3. `npm run dev` (Inicia el servidor)
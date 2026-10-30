# ms-conductores · Plantilla del Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **conductores** de la aplicación,
con **Node.js + Express** organizado en capas. 

Esta es la versión del Taller 1: datos en memoria y tres operaciones. La versión completa
(MySQL, contraseña cifrada, inicio de sesión y tokens JWT) se entrega en el Taller 3.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3004/health y http://localhost:3004/conductores

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/cponductores.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/conductores.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/conductores.service.js | Lógica de negocio | Validaciones y reglas (cedula única, categoria c2 o c3, sede cali,medellin o bogota, telefono de 10 digitos, cedula de 7 a 10 digitos); no conoce HTTP ni la base de datos |
| src/repositories/conductores.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/conductor.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-conductores","estado":"ok"}` |
| GET | /conductor | 200 arreglo de conductores |
| GET | /conductores/:id | 200 conductor · 400 id inválido · 404 no existe |
| POST | /conductores | 201 conductor creado · 400 datos inválidos · 409 cedula repetido |

Ejemplo de cuerpo para POST:
` { "nombre": "Andrés Castillo", "cedula": "1110365999", "categoria_licencia": "c2", "telefono": "3004567890", "sede": "bogota" }`

Los roles válidos se configuran en el archivo .env (`ROLES=administrador,despacho,flota`).

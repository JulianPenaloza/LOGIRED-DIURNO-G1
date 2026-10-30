# ms-clientes · Taller 1 (Módulo 3)

Redes y Servicios Multimedia · UAO · Microservicio de **clientes** de LogiRed S.A.S.,
con **Node.js + Express** organizado en capas. Gestiona los clientes de la empresa
(personas o empresas que envían paquetes). Es la entidad de la que depende ms-envios
mediante `cliente_id`.

Esta es la versión del Taller 1: datos en memoria y tres operaciones. En el Taller 2 se
completa el CRUD REST y se conecta a MySQL; en el Taller 3 se despliega en servidor2.

## Cómo ejecutarlo

Requisitos: Node.js LTS 22 o superior (`node -v`).

```
npm install                 # descarga Express en node_modules
copy .env.example .env      # en Windows (en Linux/Mac: cp .env.example .env)
npm run dev                 # inicia y se reinicia solo al guardar cambios
```

Prueben en el navegador: http://localhost:3002/health y http://localhost:3002/clientes

## Capas

| Archivo | Capa | Responsabilidad |
|---|---|---|
| src/index.js | Arranque | Lee PORT y HOST y pone el servidor a escuchar |
| src/app.js | Configuración | Middlewares, /health, montaje de rutas, manejo de errores |
| src/routes/clientes.routes.js | Presentación | Método HTTP + URI → función del controlador |
| src/controllers/clientes.controller.js | Presentación | Lee la petición, llama al servicio, arma la respuesta |
| src/services/clientes.service.js | Lógica de negocio | Validaciones y reglas (documento único); no conoce HTTP ni la base de datos |
| src/repositories/clientes.repository.js | Acceso a datos | Guarda y consulta (en memoria en el Taller 1) |
| src/models/clientes.js | Modelo | Atributos de la entidad y su validación |
| src/utils/http-error.js | Utilidad | Error con código de estado HTTP |

## Atributos (contrato)

| Atributo | Tipo | Obligatorio al crear | Reglas |
|---|---|---|---|
| id | entero | No (lo asigna el servicio) | Positivo y único |
| nombre | texto | Sí | No vacío |
| documento | texto | Sí | De 6 a 15 dígitos; único (si se repite: 409) |
| telefono | texto | Sí | De 7 a 10 dígitos |
| email | texto | Sí | Formato de correo válido; se guarda en minúsculas |
| ciudad | texto | Sí | No vacía |

## Endpoints (Taller 1)

| Método | URI | Respuesta |
|---|---|---|
| GET | /health | 200 `{"servicio":"ms-clientes","estado":"ok"}` |
| GET | /clientes | 200 arreglo de clientes |
| GET | /clientes/:id | 200 cliente · 400 id inválido · 404 no existe |
| POST | /clientes | 201 cliente creado · 400 datos inválidos · 409 documento repetido |

Ejemplo de cuerpo para POST (`documento` y `telefono` van como texto, entre comillas):

```json
{
  "nombre": "Transportes Pacífico",
  "documento": "900456789",
  "telefono": "3004445566",
  "email": "info@pacifico.com",
  "ciudad": "Buenaventura"
}
```

## Relaciones

ms-clientes no guarda referencias a otros microservicios. ms-envios lo consultará por REST
(`GET /clientes/:id` y `GET /clientes?ids=...`); el filtro `?ids=` se agrega más adelante.
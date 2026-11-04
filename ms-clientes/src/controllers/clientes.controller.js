// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/clientes.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /clientes
// GET /clientes, /clientes?ciudad=Cali, /clientes?ids=1,3,8
async function listar(req, res) {
  const filtros = { ciudad: req.query.ciudad };

  if (req.query.ids !== undefined) {
    const ids = String(req.query.ids).split(',').map((texto) => Number(texto.trim()));
    if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'ids debe ser una lista de enteros positivos separados por comas');
    }
    filtros.ids = ids;
  }

  const clientes = await service.listar(filtros);
  res.status(200).json(clientes);
}

// GET /clientes/:id
async function obtener(req, res) {
  const cliente = await service.obtener(leerId(req));
  res.status(200).json(cliente);
}

// POST /clientes
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}


// PUT /clientes/:id
async function actualizar(req, res) {
  const cliente = await service.actualizar(leerId(req), req.body);
  res.status(200).json(cliente);
}

module.exports = { listar, obtener, crear, actualizar };
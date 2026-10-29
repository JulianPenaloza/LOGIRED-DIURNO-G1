
const service = require('../services/vehiculos.service');
const HttpError = require('../utils/http-error');

// Valida el ID recibido por la URL.
function leerId(req) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, 'El id debe ser un entero positivo');
  }

  return id;
}

// GET /vehiculos
async function listar(req, res) {
  const vehiculos = await service.listar();
  res.status(200).json(vehiculos);
}

// GET /vehiculos/:id
async function obtener(req, res) {
  const vehiculo = await service.obtener(leerId(req));
  res.status(200).json(vehiculo);
}

// POST /vehiculos
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

module.exports = { listar, obtener, crear };

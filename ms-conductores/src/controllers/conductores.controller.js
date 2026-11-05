// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/conductores.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /Conductores
async function listar(req, res) {
  const filtros = {categoria_licencia: req.query.categoria_licencia, sede: req.query.sede};
  if (req.query.ids) {
    filtros.ids = String(req.query.ids).split(',').map(Number);
    if (filtros.ids.some((id) => !Number.isInteger(id) || id <= 0)) {
      throw new HttpError(400, 'Los ids deben ser enteros positivos separados por comas');
    }
  }
  const conductores = await service.listar(filtros);
  res.status(200).json(conductores);
}

// GET /Conductores/:id
async function obtener(req, res) {
  const conductor = await service.obtener(leerId(req));
  res.status(200).json(conductor);
}

// POST /Conductores
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /Conductores/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body);
  res.status(200).json(actualizado);
}

// DELETE /Conductores/:id
async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).send();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };

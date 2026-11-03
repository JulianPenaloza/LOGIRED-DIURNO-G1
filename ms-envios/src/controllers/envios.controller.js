// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body, query),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/envios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

async function listar(req, res) {
  // Captura parámetros de consulta en la URL, ej: ?estado=pendiente
  const filtros = { estado: req.query.estado };
  const envios = await service.listar(filtros);
  res.status(200).json(envios);
}

async function obtener(req, res) {
  const envio = await service.obtener(leerId(req));
  res.status(200).json(envio);
}

async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

async function actualizar(req, res) {
  const actualizado = await service.actualizar(leerId(req), req.body);
  res.status(200).json(actualizado);
}

async function eliminar(req, res) {
  await service.eliminar(leerId(req));
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
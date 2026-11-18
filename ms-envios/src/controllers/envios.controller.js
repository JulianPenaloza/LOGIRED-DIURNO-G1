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

async function rastrear(req, res) {
  const envio = await service.rastrear(req.params.codigo);
  res.status(200).json(envio);
}

async function listar(req, res) {
  // Captura parámetros de consulta en la URL, ej: ?estado=pendiente
  const filtros = { estado: req.query.estado };
  
  // Se pasa el token al servicio para la composición
  const envios = await service.listar(filtros, req.headers.authorization);
  res.status(200).json(envios);
}

async function obtener(req, res) {
  // Se pasa el token al servicio para la composición
  const envio = await service.obtener(leerId(req), req.headers.authorization);
  res.status(200).json(envio);
}

async function crear(req, res) {
  // Se pasa el token al servicio para la validación relacional
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

async function actualizar(req, res) {
  // Se pasa el token al servicio para la validación relacional
  const actualizado = await service.actualizar(leerId(req), req.body, req.headers.authorization);
  res.status(200).json(actualizado);
}

async function eliminar(req, res) {
  // El eliminar no necesita el token porque no hace consultas cruzadas con ms-clientes
  await service.eliminar(leerId(req));
  res.status(204).end(); // 204 No Content: éxito, sin cuerpo
}

module.exports = { rastrear, listar, obtener, crear, actualizar, eliminar };
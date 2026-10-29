// =====================================================================
// CAPA DE PRESENTACIÓN (controlador)
// Traduce HTTP <-> servicio: lee la petición (params, body),
// llama al servicio y arma la respuesta (código de estado + JSON).
// =====================================================================
const service = require('../services/envios.service');
const HttpError = require('../utils/http-error');

function leerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, 'El id debe ser un entero positivo');
  return id;
}

// GET /envios
async function listar(req, res) {
  const envios = await service.listar();
  res.status(200).json(envios);
}

// GET /envios/:id
async function obtener(req, res) {
  const envio = await service.obtener(leerId(req));
  res.status(200).json(envio);
}

// POST /envios
async function crear(req, res) {
  const nuevo = await service.crear(req.body);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// GET /envios/codigo/:codigo
async function obtenerPorCodigo(req, res) {
  const envio = await service.obtenerPorCodigo(req.params.codigo);
  if (!envio) return res.status(404).json({ error: 'Envío no encontrado' });
  res.status(200).json(envio);
}

// GET /envios/estado/:estado
async function obtenerPorEstado(req, res) {
  const envios = await service.obtenerPorEstado(req.params.estado);
  res.status(200).json(envios);
}

// GET /envios/cliente/:cliente_id
async function obtenerPorCliente(req, res) {
  const cliente_id = Number(req.params.cliente_id);
  const envios = await service.obtenerPorCliente(cliente_id);
  res.status(200).json(envios);
}

// DELETE /envios/:id
async function eliminarEnvio(req, res) {
  const eliminado = await service.eliminar(leerId(req));
  if (!eliminado) return res.status(404).json({ error: 'Envío no encontrado' });
  res.status(204).send(); 
}

module.exports = { 
  listar, 
  obtener, 
  crear, 
  obtenerPorCodigo, 
  obtenerPorEstado, 
  obtenerPorCliente, 
  eliminarEnvio 
};
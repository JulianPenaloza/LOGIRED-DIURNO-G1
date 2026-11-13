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
  const resultado = await service.listar(req.headers.authorization);
  if (resultado.warning) {
    res.set('X-Advertencia', resultado.warning);
  }
  res.status(200).json(resultado.data);
}

// GET /vehiculos/:id
async function obtener(req, res) {
  const resultado = await service.obtener(
    leerId(req),
    req.headers.authorization
  );
  if (resultado.warning) {
    res.set('X-Advertencia', resultado.warning);
  }
  res.status(200).json(resultado.data);
}

// POST /vehiculos
async function crear(req, res) {
  const nuevo = await service.crear(req.body, req.headers.authorization);
  res.status(201).location(`${req.baseUrl}/${nuevo.id}`).json(nuevo);
}

// PUT /vehiculos/:id
async function actualizar(req, res) {
  const actualizado = await service.actualizar(
    leerId(req),
    req.body,
    req.headers.authorization
  );
  res.status(200).json(actualizado);
}

// DELETE /vehiculos/:id
async function eliminar(req, res) {
  const eliminado = await service.eliminar(leerId(req));
  res.status(200).json({
    mensaje: 'Vehículo eliminado correctamente',
    vehiculo: eliminado
  });
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};

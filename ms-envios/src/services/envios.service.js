// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

async function listar(filtros = {}) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envío con id ${id}`);
  return envio;
}

async function crear(datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const envio = construirEnvio(datos);

  if (envio.codigo && await repo.findByCodigo(envio.codigo)) {
    throw new HttpError(409, `Ya existe un envío con el código de guía ${envio.codigo}`);
  }

  return repo.create(envio);
}

async function actualizar(id, datos) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el envío con id ${id}`);

  const envio = construirEnvio(datos);

  if (envio.codigo && envio.codigo !== existente.codigo && await repo.findByCodigo(envio.codigo)) {
    throw new HttpError(409, `Ya existe un envío con el código de guía ${envio.codigo}`);
  }

  return repo.update(id, envio);
}

async function eliminar(id) {
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el envío con id ${id}`);
  await repo.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
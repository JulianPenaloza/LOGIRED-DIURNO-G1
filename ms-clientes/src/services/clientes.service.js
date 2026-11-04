// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/clientes.repository');
const { validarCliente, construirCliente } = require('../models/clientes');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const cliente = await repo.findById(id);
  if (!cliente) throw new HttpError(404, `No existe el cliente con id ${id}`);
  return cliente;
}

async function crear(datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const cliente = construirCliente(datos);

  // Regla de negocio: no puede haber dos clientes con el mismo documento
  // (el documento identifica a la persona o empresa). 409 = Conflict.
  if (await repo.findByDocumento(cliente.documento)) {
    throw new HttpError(409, `Ya existe un cliente con el documento ${cliente.documento}`);
  }

  return repo.create(cliente);
}

async function actualizar(id, datos) {
  const errores = validarCliente(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  if (!(await repo.findById(id))) {
    throw new HttpError(404, `No existe el cliente con id ${id}`);
  }

  const cliente = construirCliente(datos);

  // Regla de negocio: el documento no puede pertenecer a OTRO cliente.
  // Si es el del mismo cliente que se está editando, no hay conflicto.
  const otro = await repo.findByDocumento(cliente.documento);
  if (otro && otro.id !== id) {
    throw new HttpError(409, `Ya existe un cliente con el documento ${cliente.documento}`);
  }

  return repo.update(id, cliente);
}

module.exports = { listar, obtener, crear, actualizar };
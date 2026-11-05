// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/conductores.repository');
const { validarConductor, construirConductor } = require('../models/conductor');
const HttpError = require('../utils/http-error');

async function listar(filtros) {
  return repo.findAll(filtros);
}

async function obtener(id) {
  const conductor = await repo.findById(id);
  if (!conductor) throw new HttpError(404, `No existe el conductor con id ${id}`);
  return conductor;
}

async function crear(datos) {
  const errores = validarConductor(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const conductor = construirConductor(datos);

  // Regla de negocio: no puede haber dos conductores con la misma cédula ni con el mismo celular
  //  409 = Conflict.
  if (await repo.findByCedula(conductor.cedula)) {
    throw new HttpError(409, `Ya existe un conductor con la cédula ${conductor.cedula}`);
  }

  if (await repo.findByCelular(conductor.telefono)) {
    throw new HttpError(409, `Ya existe un conductor con el celular ${conductor.telefono}`);
  }

  return repo.create(conductor);
}

async function actualizar(id, conductor) {
  const errores = validarConductor(conductor);
  if (errores.length > 0) {
    throw new HttpError(400, errores.join(', '));
  };
  const datos= construirConductor(conductor);

  const existente = await repo.findByCedula(id);

  if (existente && existente.id !== id) {
    throw new HttpError(409, `Ya existe un conductor con la cédula ${datos.cedula}`);
  }

  if (await repo.findByCelular(datos.celular) && existente.id !== id) {
    throw new HttpError(409, `Ya existe un conductor con el celular ${datos.celular}`);
  }

  const actualizado = await repo.update(id, datos);
  if (!actualizado) {
    throw new HttpError(404, `No existe un conductor con id ${id}`);
  };
  return actualizado;
}

async function eliminar(id) {
  const eliminado = await repo.remove(id);
  if (!eliminado) {
    throw new HttpError(404, `No existe un conductor con id ${id}`);
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };

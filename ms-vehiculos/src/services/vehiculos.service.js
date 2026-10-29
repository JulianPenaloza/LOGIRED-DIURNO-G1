
const repo = require('../repositories/vehiculos.repository');
const {
  validarVehiculo,
  construirVehiculo
} = require('../models/vehiculo');
const HttpError = require('../utils/http-error');

async function listar() {
  return repo.findAll();
}

async function obtener(id) {
  const vehiculo = await repo.findById(id);

  if (!vehiculo) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

  return vehiculo;
}

async function crear(datos) {
  const errores = validarVehiculo(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  const vehiculo = construirVehiculo(datos);

  // La placa debe ser única.
  if (await repo.findByPlaca(vehiculo.placa)) {
    throw new HttpError(
      409,
      `Ya existe un vehículo con la placa ${vehiculo.placa}`
    );
  }

  return repo.create(vehiculo);
}

module.exports = { listar, obtener, crear };

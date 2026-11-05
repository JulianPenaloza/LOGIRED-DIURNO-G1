const repo = require('../repositories/vehiculos.repository');

const {
  validarVehiculo,
  construirVehiculo
} = require('../models/vehiculo');

const HttpError = require('../utils/http-error');

// Listar todos los vehículos
async function listar() {
  return await repo.findAll();
}

// Obtener un vehículo por ID
async function obtener(id) {
  const vehiculo = await repo.findById(id);

  if (!vehiculo) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

  return vehiculo;
}

// Crear un vehículo
async function crear(datos) {
  const errores = validarVehiculo(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  const vehiculo = construirVehiculo(datos);

  // Verificar que la placa no esté registrada
  const existente = await repo.findByPlaca(vehiculo.placa);

  if (existente) {
    throw new HttpError(
      409,
      `Ya existe un vehículo con la placa ${vehiculo.placa}`
    );
  }

  return await repo.create(vehiculo);
}

// Eliminar un vehículo
async function eliminar(id) {
  const vehiculo = await obtener(id);

  await repo.remove(id);

  return vehiculo;
}

module.exports = {
  listar,
  obtener,
  crear,
  eliminar
};
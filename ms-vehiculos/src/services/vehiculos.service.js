const repo = require('../repositories/vehiculos.repository');

const {
  validarVehiculo,
  construirVehiculo
} = require('../models/vehiculo');

const HttpError = require('../utils/http-error');

function manejarErrorPlacaDuplicada(error, placa) {
  if (error && error.code === 'ER_DUP_ENTRY') {
    throw new HttpError(
      409,
      `Ya existe un vehículo con la placa ${placa}`
    );
  }

  throw error;
}

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

  try {
    return await repo.create(vehiculo);
  } catch (error) {
    manejarErrorPlacaDuplicada(error, vehiculo.placa);
  }
}

// Actualizar un vehículo existente
async function actualizar(id, datos) {
  const existente = await repo.findById(id);

  if (!existente) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

  const errores = validarVehiculo(datos);

  if (errores.length > 0) {
    throw new HttpError(400, 'Datos inválidos', errores);
  }

  const vehiculo = construirVehiculo(datos);
  const vehiculoConPlaca = await repo.findByPlaca(vehiculo.placa);

  if (vehiculoConPlaca && Number(vehiculoConPlaca.id) !== id) {
    throw new HttpError(
      409,
      `Ya existe un vehículo con la placa ${vehiculo.placa}`
    );
  }

  let actualizado;

  try {
    actualizado = await repo.update(id, vehiculo);
  } catch (error) {
    manejarErrorPlacaDuplicada(error, vehiculo.placa);
  }

  if (!actualizado) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

  return actualizado;
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
  actualizar,
  eliminar
};

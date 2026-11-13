const repo = require('../repositories/vehiculos.repository');

const {
  validarVehiculo,
  construirVehiculo
} = require('../models/vehiculo');

const HttpError = require('../utils/http-error');
const conductoresClient = require('../clients/conductores.client');

const ADVERTENCIA_CONDUCTORES =
  'No fue posible consultar el servicio de conductores';

async function validarConductorAsignado(conductorId, authorization) {
  if (conductorId !== null && conductorId !== undefined) {
    await conductoresClient.obtenerPorId(conductorId, authorization);
  }
}

function agregarConductorNulo(vehiculos) {
  return vehiculos.map((vehiculo) => ({ ...vehiculo, conductor: null }));
}

async function componerConductores(vehiculos, authorization) {
  const idsPorClave = new Map();
  for (const vehiculo of vehiculos) {
    const id = vehiculo.conductor_id;
    if (id !== null && id !== undefined) {
      idsPorClave.set(String(id), id);
    }
  }
  const ids = [...idsPorClave.values()];

  if (ids.length === 0) {
    return { data: agregarConductorNulo(vehiculos), warning: null };
  }

  let conductores;
  try {
    conductores = await conductoresClient.obtenerPorIds(ids, authorization);
  } catch {
    return {
      data: agregarConductorNulo(vehiculos),
      warning: ADVERTENCIA_CONDUCTORES
    };
  }

  const porId = new Map(
    conductores.map((conductor) => [String(conductor.id), conductor])
  );

  return {
    data: vehiculos.map((vehiculo) => ({
      ...vehiculo,
      conductor: vehiculo.conductor_id == null
        ? null
        : porId.get(String(vehiculo.conductor_id)) || null
    })),
    warning: null
  };
}

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
async function listar(authorization) {
  const vehiculos = await repo.findAll();
  return componerConductores(vehiculos, authorization);
}

// Obtener un vehículo por ID
async function obtener(id, authorization) {
  const vehiculo = await repo.findById(id);

  if (!vehiculo) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

  const resultado = await componerConductores([vehiculo], authorization);
  return { data: resultado.data[0], warning: resultado.warning };
}

// Crear un vehículo
async function crear(datos, authorization) {
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

  await validarConductorAsignado(vehiculo.conductor_id, authorization);

  try {
    return await repo.create(vehiculo);
  } catch (error) {
    manejarErrorPlacaDuplicada(error, vehiculo.placa);
  }
}

// Actualizar un vehículo existente
async function actualizar(id, datos, authorization) {
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

  await validarConductorAsignado(vehiculo.conductor_id, authorization);

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
  const vehiculo = await repo.findById(id);

  if (!vehiculo) {
    throw new HttpError(404, `No existe el vehículo con id ${id}`);
  }

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


const TIPOS_VALIDOS = ['moto', 'furgon', 'camion'];

const ESTADOS_VALIDOS = [
  'disponible',
  'en_ruta',
  'mantenimiento'
];

function validarVehiculo(datos) {
  const errores = [];

  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) {
    return ['Se esperaba un objeto JSON con los datos del vehículo'];
  }

  if (
    typeof datos.placa !== 'string' ||
    datos.placa.trim() === ''
  ) {
    errores.push('La placa es obligatoria');
  }

  if (
    typeof datos.tipo !== 'string' ||
    !TIPOS_VALIDOS.includes(datos.tipo.trim().toLowerCase())
  ) {
    errores.push('El tipo debe ser moto, furgon o camion');
  }

  if (
    typeof datos.capacidad_kg !== 'number' ||
    !Number.isFinite(datos.capacidad_kg) ||
    datos.capacidad_kg <= 0
  ) {
    errores.push('La capacidad_kg debe ser un número mayor que cero');
  }

  if (
    datos.estado !== undefined &&
    !ESTADOS_VALIDOS.includes(datos.estado)
  ) {
    errores.push(
      'El estado debe ser disponible, en_ruta o mantenimiento'
    );
  }

  if (
    datos.conductor_id !== undefined &&
    datos.conductor_id !== null &&
    (!Number.isInteger(datos.conductor_id) || datos.conductor_id <= 0)
  ) {
    errores.push('El conductor_id debe ser un entero positivo o null');
  }

  return errores;
}

function construirVehiculo(datos) {
  return {
    placa: datos.placa.trim().toUpperCase(),
    tipo: datos.tipo.trim().toLowerCase(),
    capacidad_kg: datos.capacidad_kg,
    estado: datos.estado === undefined ? 'disponible' : datos.estado,
    conductor_id:
      datos.conductor_id === undefined ? null : datos.conductor_id
  };
}

module.exports = { validarVehiculo, construirVehiculo };

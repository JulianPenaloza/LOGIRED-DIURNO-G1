// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Envío y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

const ESTADOS_VALIDOS = ['pendiente', 'en transito', 'entregado', 'cancelado'];

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarEnvio(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del envío'];
  }
  if (!datos.codigo || typeof datos.codigo !== 'string' || datos.codigo.trim() === '') {
    errores.push('codigo es obligatorio');
  }
  if (!datos.origen || typeof datos.origen !== 'string' || datos.origen.trim() === '') {
    errores.push('origen es obligatorio');
  }
  if (!datos.destino || typeof datos.destino !== 'string' || datos.destino.trim() === '') {
    errores.push('destino es obligatorio');
  }
  if (datos.estado && !ESTADOS_VALIDOS.includes(datos.estado.toLowerCase())) {
    errores.push(`estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  if (datos.clienteId === undefined || typeof datos.clienteId !== 'number') {
    errores.push('clienteId es obligatorio y debe ser un número entero');
  }
  return errores;
}

// Construye un envío "limpio" solo con los campos permitidos
function construirEnvio(datos) {
  return {
    codigo: datos.codigo.trim(),
    origen: datos.origen.trim(),
    destino: datos.destino.trim(),
    estado: datos.estado ? datos.estado.toLowerCase() : 'pendiente',
    clienteId: datos.clienteId
  };
}

module.exports = { validarEnvio, construirEnvio };
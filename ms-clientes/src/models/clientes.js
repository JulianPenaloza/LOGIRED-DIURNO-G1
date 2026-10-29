// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Cliente y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
// =====================================================================

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOCUMENTO_VALIDO = /^\d{6,15}$/;

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarCliente(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del cliente'];
  }
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (typeof datos.documento !== 'string' || !DOCUMENTO_VALIDO.test(datos.documento.trim())) {
    errores.push('documento es obligatorio y debe tener entre 6 y 15 dígitos');
  }
  if (!datos.telefono || typeof datos.telefono !== 'string' || datos.telefono.trim() === '') {
    errores.push('telefono es obligatorio');
  }
  if (typeof datos.email !== 'string' || !EMAIL_VALIDO.test(datos.email.trim())) {
    errores.push('email es obligatorio y debe tener un formato válido');
  }
  if (!datos.ciudad || typeof datos.ciudad !== 'string' || datos.ciudad.trim() === '') {
    errores.push('ciudad es obligatoria');
  }
  return errores;
}

// Construye un cliente "limpio" solo con los campos permitidos
function construirCliente(datos) {
  return {
    nombre: datos.nombre.trim(),
    documento: datos.documento.trim(),
    telefono: datos.telefono.trim(),
    email: datos.email.trim().toLowerCase(),
    ciudad: datos.ciudad.trim(),
  };
}

module.exports = { validarCliente, construirCliente };
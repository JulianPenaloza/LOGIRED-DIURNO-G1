// =====================================================================
// CAPA DE MODELO (entidad)
// Define qué campos tiene un Usuario y qué reglas deben cumplir.
// No sabe nada de HTTP ni de bases de datos.
//
// Versión del Taller 1: todavía sin contraseña. La contraseña cifrada
// y el inicio de sesión se agregan en la versión completa (Taller 3).
// =====================================================================

const CEDULA_VALIDA = /^\d{10}$/;  // 10 dígitos
const TELEFONO_VALIDO = /^\d{7,10}$/;  // 7 a 10 dígitos
const SEDES_VALIDAS = ['cali', 'medellin', 'bogota'];  // sedes válidas
const LICENCIA_VALIDAS = ['c2','c3'];  // licencias válidas

// Devuelve una lista de errores de validación (vacía si todo está bien)
function validarConductor(datos) {
  const errores = [];
  if (!datos || typeof datos !== 'object') {
    return ['Se esperaba un objeto JSON con los datos del conductor'];
  }
  if (!datos.nombre || typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('nombre es obligatorio');
  }
  if (!datos.cedula || typeof datos.cedula !== 'string' || !CEDULA_VALIDA.test(datos.cedula)) {
    errores.push('cedula es obligatoria y debe tener un formato válido');
  }
  if (!datos.categoria_licencia || typeof datos.categoria_licencia !== 'string' || datos.categoria_licencia.trim() === '') {
    errores.push('categoria_licencia es obligatoria');
  }
  if (!datos.categoria_licencia || typeof datos.categoria_licencia !== 'string' || !LICENCIA_VALIDAS.includes(datos.categoria_licencia)) {
    errores.push(`categoria_licencia debe ser una de: ${LICENCIA_VALIDAS.join(', ')}`);
  }
  if (!datos.telefono || typeof datos.telefono !== 'string' || !TELEFONO_VALIDO.test(datos.telefono)) {
    errores.push('telefono es obligatorio y debe tener un formato válido');
  }
  if (!datos.sede || typeof datos.sede !== 'string' || !SEDES_VALIDAS.includes(datos.sede)) {
    errores.push(`sede debe ser una de: ${SEDES_VALIDAS.join(', ')}`);
  }
  return errores;
}

// Construye un conductor "limpio" solo con los campos permitidos
function construirConductor(datos) {
  return {
    nombre: datos.nombre.trim(),
    cedula: datos.cedula.trim(),
    categoria_licencia: datos.categoria_licencia.trim(),
    telefono: datos.telefono.trim(),
    sede: datos.sede.trim(),
  };
}

module.exports = { validarConductor, construirConductor };

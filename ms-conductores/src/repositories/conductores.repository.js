// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const conductores = [
  { id: 1, nombre: 'Carlos Rodríguez', cedula: '1110365790', categoria_licencia: 'c2', telefono: '3001234567', sede: 'cali' },
  { id: 2, nombre: 'Laura Gómez', cedula: '1110365791', categoria_licencia: 'c3', telefono: '3009876543', sede: 'medellin' },
  { id: 3, nombre: 'Andrés Castillo', cedula: '1110365792', categoria_licencia: 'c2', telefono: '3004567890', sede: 'bogota' },
];
let siguienteId = 4;

async function findAll() {
  return conductores;
}

async function findById(id) {
  return conductores.find((c) => c.id === id) || null;
}

async function findByCedula(cedula) {
  return conductores.find((c) => c.cedula === cedula) || null;
}

async function create(conductor) {
  const nuevo = { id: siguienteId++, ...conductor };
  conductores.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByCedula, create };

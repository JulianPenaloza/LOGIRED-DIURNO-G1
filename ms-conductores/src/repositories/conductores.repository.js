// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.

const HttpError = require("../utils/http-error");

// =====================================================================
const conductores = [
  { id: 1, nombre: 'Carlos Rodríguez', cedula: '1110365790', categoria_licencia: 'c2', telefono: '3001234567', sede: 'cali' },
  { id: 2, nombre: 'Laura Gómez', cedula: '1110365791', categoria_licencia: 'c3', telefono: '3009876543', sede: 'medellin' },
  { id: 3, nombre: 'Andrés Castillo', cedula: '1110365792', categoria_licencia: 'c2', telefono: '3004567890', sede: 'bogota' },
];
let siguienteId = 4;

async function findAll(filtros = {}) {
  return conductores.filter((c) => {
    if (filtros.ids && !filtros.ids.includes(c.id)) return false;
    if (filtros.categoria_licencia && c.categoria_licencia !== filtros.categoria_licencia) return false;
    if (filtros.sede && c.sede !== filtros.sede) return false;
    return true;
  });
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

async function update(id, conductor) {
  const index = conductores.findIndex((c) => c.id === id);
  if (index === -1) {
    return null; // No se encontró el conductor con el id proporcionado
  };
  conductores[index] = { id, ...conductor };
  return conductores[index];
}

async function remove(id) {
  const index = conductores.findIndex((c) => c.id === id);
  if (index === -1) {
    return false; // No se encontró el conductor con el id proporcionado
  }
  conductores.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, findByCedula, create, update, remove };

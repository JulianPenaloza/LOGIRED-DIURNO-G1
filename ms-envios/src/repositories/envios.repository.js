// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const envios = [
  { id: 1, codigo: 'ENV-001', origen: 'Cali', destino: 'Bogotá', estado: 'en transito', clienteId: 1 },
  { id: 2, codigo: 'ENV-002', origen: 'Medellín', destino: 'Cali', estado: 'entregado', clienteId: 2 },
  { id: 3, codigo: 'ENV-003', origen: 'Cali', destino: 'Cartagena', estado: 'pendiente', clienteId: 1 },
];
let siguienteId = 4;

async function findAll() {
  return envios;
}

async function findById(id) {
  return envios.find((e) => e.id === id) || null;
}

async function findByCodigo(codigo) {
  return envios.find((e) => e.codigo === codigo) || null;
}

async function create(envio) {
  const nuevo = { id: siguienteId++, ...envio };
  envios.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByCodigo, create };
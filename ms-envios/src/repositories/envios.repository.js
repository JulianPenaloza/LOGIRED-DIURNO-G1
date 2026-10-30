// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const envios = [
  { id: 1, codigo: 'ENV-001', origen: 'Cali', destino: 'Bogotá', estado: 'en transito', cliente_id: 1 },
  { id: 2, codigo: 'ENV-002', origen: 'Medellín', destino: 'Cali', estado: 'entregado', cliente_id: 2 },
  { id: 3, codigo: 'ENV-003', origen: 'Cali', destino: 'Cartagena', estado: 'pendiente', cliente_id: 1 },
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

async function findByEstado(estado) {
  return envios.filter((e) => e.estado === estado);
}

async function findByCliente(cliente_id) {
  return envios.filter((e) => e.cliente_id === cliente_id);
}

async function remove(id) {
  const index = envios.findIndex((e) => e.id === id);
  if (index === -1) return false;
  envios.splice(index, 1);
  return true;
}

module.exports = { 
  findAll, 
  findById, 
  findByCodigo, 
  create, 
  findByEstado, 
  findByCliente, 
  remove 
};
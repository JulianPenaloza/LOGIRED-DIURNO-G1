// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.
// =====================================================================
const clientes = [
  { id: 1, nombre: 'Distribuidora El Valle', documento: '900123456', telefono: '3001112233', email: 'contacto@elvalle.com', ciudad: 'Cali' },
  { id: 2, nombre: 'Comercial Andina', documento: '900234567', telefono: '3002223344', email: 'ventas@andina.com', ciudad: 'Bogotá' },
  { id: 3, nombre: 'Tienda La Esquina', documento: '900345678', telefono: '3003334455', email: 'info@laesquina.com', ciudad: 'Medellín' },
];
let siguienteId = 4;

async function findAll() {
  return clientes;
}

async function findById(id) {
  return clientes.find((c) => c.id === id) || null;
}

async function findByDocumento(documento) {
  return clientes.find((c) => c.documento === documento) || null;
}

async function create(cliente) {
  const nuevo = { id: siguienteId++, ...cliente };
  clientes.push(nuevo);
  return nuevo;
}

module.exports = { findAll, findById, findByDocumento, create };
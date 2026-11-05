// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 2: los datos viven en MySQL (base clientes_db).
// Las funciones conservan el nombre y el resultado de la versión en
// memoria, por eso las otras capas no cambian.
// =====================================================================
const pool = require('../db');

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM clientes';
  const condiciones = [];
  const valores = [];
  if (filtros.ciudad) {
    condiciones.push('ciudad = ?');
    valores.push(filtros.ciudad);
  }
  if (filtros.ids) {                       // ?ids=1,3,8 → WHERE id IN (1, 3, 8)
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (condiciones.length > 0) sql += ' WHERE ' + condiciones.join(' AND ');
  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas;
}

async function findById(id) {
  // ? es un parámetro: el valor viaja aparte de la consulta (evita inyección SQL)
  const [filas] = await pool.query('SELECT * FROM clientes WHERE id = ?', [id]);
  return filas.length > 0 ? filas[0] : null;
}

async function findByDocumento(documento) {
  const [filas] = await pool.query('SELECT * FROM clientes WHERE documento = ?', [documento]);
  return filas.length > 0 ? filas[0] : null;
}

async function create(cliente) {
  const [resultado] = await pool.query(
    'INSERT INTO clientes (nombre, documento, telefono, email, ciudad) VALUES (?, ?, ?, ?, ?)',
    [cliente.nombre, cliente.documento, cliente.telefono, cliente.email, cliente.ciudad]);
  return findById(resultado.insertId);     // MySQL devuelve el id generado
}

async function update(id, cliente) {
  await pool.query(
    'UPDATE clientes SET nombre = ?, documento = ?, telefono = ?, email = ?, ciudad = ? WHERE id = ?',
    [cliente.nombre, cliente.documento, cliente.telefono, cliente.email, cliente.ciudad, id]);
  return findById(id);                     // null si el id no existe
}

async function remove(id) {
  const [resultado] = await pool.query('DELETE FROM clientes WHERE id = ?', [id]);
  return resultado.affectedRows > 0;       // true si borró una fila
}

module.exports = { findAll, findById, findByDocumento, create, update, remove };
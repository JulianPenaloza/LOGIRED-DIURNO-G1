// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio - VERSIÓN MySQL)
// Guarda y consulta los datos en la base de datos envios_db.
// =====================================================================
const pool = require('../db');

function aEnvio(fila) {
  return { ...fila };
}

async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM envios';
  const condiciones = [];
  const valores = [];

  if (filtros.estado) {
    condiciones.push('estado = ?');
    valores.push(filtros.estado);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  const [filas] = await pool.query(sql + ' ORDER BY id', valores);
  return filas.map(aEnvio);
}

async function findById(id) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE id = ?', [id]);
  return filas.length > 0 ? aEnvio(filas[0]) : null;
}

async function findByCodigo(codigo) {
  const [filas] = await pool.query('SELECT * FROM envios WHERE codigo = ?', [codigo]);
  return filas.length > 0 ? aEnvio(filas[0]) : null;
}

async function create(envio) {
  const [resultado] = await pool.query(
    'INSERT INTO envios (codigo, origen, destino, estado, cliente_id) VALUES (?, ?, ?, ?, ?)',
    [envio.codigo, envio.origen, envio.destino, envio.estado, envio.cliente_id]
  );
  return findById(resultado.insertId);
}

async function update(id, envio) {
  await pool.query(
    'UPDATE envios SET codigo = ?, origen = ?, destino = ?, estado = ?, cliente_id = ? WHERE id = ?',
    [envio.codigo, envio.origen, envio.destino, envio.estado, envio.cliente_id, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM envios WHERE id = ?', [id]);
}

module.exports = { findAll, findById, findByCodigo, create, update, remove };
// =====================================================================
// CAPA DE ACCESO A DATOS (repositorio)
// Única capa que sabe DÓNDE se guardan los datos.
// Versión del Taller 1: datos en memoria (se pierden al reiniciar).
// En el Taller 2 se reemplaza por MySQL SIN tocar las otras capas.
// Todas las funciones son async (devuelven promesas) para que el cambio
// a una base de datos real no obligue a modificar la capa de servicio.

const HttpError = require("../utils/http-error");
const pool = require("../db");
// =====================================================================
function aConductor(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    cedula: row.cedula,
    categoria_licencia: row.categoria_licencia,
    telefono: row.telefono,
    sede: row.sede
  };
}


async function findAll(filtros = {}) {
  let sql = 'SELECT * FROM conductores';
  const condiciones = [];
  const valores = [];
  if (filtros.ids) {
    condiciones.push('id IN (?)');
    valores.push(filtros.ids);
  }
  if (filtros.categoria_licencia) {
    condiciones.push('categoria_licencia = ?');
    valores.push(filtros.categoria_licencia);
  }
  if (filtros.sede) {
    condiciones.push('sede = ?');
    valores.push(filtros.sede);
  }

  if (condiciones.length > 0) {
    sql += ' WHERE ' + condiciones.join(' AND ');
  }

  const [rows] = await pool.query(sql + ' ORDER BY id', valores);
  return rows.map(aConductor);
}

async function findById(id) {
  let sql = 'SELECT * FROM conductores WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows.length > 0 ? aConductor(rows[0]) : null;
}

async function findByCedula(cedula) {
  let sql = 'SELECT * FROM conductores WHERE cedula = ?';
  const [rows] = await pool.query(sql, [cedula]);
  return rows.length > 0 ? aConductor(rows[0]) : null;
}


async function findByCelular(celular) {
  let sql = 'SELECT * FROM conductores WHERE telefono = ?';
  const [rows] = await pool.query(sql, [celular]);
  return rows.length > 0 ? aConductor(rows[0]) : null;
}

async function create(conductor) {
  let sql = 'INSERT INTO conductores (nombre, cedula, categoria_licencia, telefono, sede) VALUES (?, ?, ?, ?, ?)';
  const [result] = await pool.query(sql, [conductor.nombre, conductor.cedula, conductor.categoria_licencia, conductor.telefono, conductor.sede]);
  return { id: result.insertId, ...conductor };
}


async function update(id, conductor) {
  let sql = 'UPDATE conductores SET nombre = ?, cedula = ?, categoria_licencia = ?, telefono = ?, sede = ? WHERE id = ?';
  const [result] = await pool.query(sql, [conductor.nombre, conductor.cedula, conductor.categoria_licencia, conductor.telefono, conductor.sede, id]);
  if (result.affectedRows === 0) {
    return null; // No se encontró el conductor con el id proporcionado
  }
  return findById(id); // Devuelve el conductor actualizado
}

async function remove(id) {
  let sql = 'DELETE FROM conductores WHERE id = ?';
  const [result] = await pool.query(sql, [id]);
  return result.affectedRows > 0;
    return false; // No se encontró el conductor con el id proporcionado
  }

module.exports = { findAll, findById, findByCedula, findByCelular, create, update, remove };

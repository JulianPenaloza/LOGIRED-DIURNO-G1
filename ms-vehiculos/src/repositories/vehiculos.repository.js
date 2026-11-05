const pool = require('../config/database');

// Obtener todos los vehículos
async function findAll() {
  const [rows] = await pool.query(
    'SELECT * FROM vehiculos ORDER BY id ASC'
  );

  return rows;
}

// Buscar un vehículo por su ID
async function findById(id) {
  const [rows] = await pool.query(
    'SELECT * FROM vehiculos WHERE id = ?',
    [id]
  );

  return rows[0] || null;
}

// Buscar un vehículo por su placa
async function findByPlaca(placa) {
  const [rows] = await pool.query(
    'SELECT * FROM vehiculos WHERE placa = ?',
    [placa]
  );

  return rows[0] || null;
}

// Crear un vehículo
async function create(vehiculo) {
  const {
    placa,
    tipo,
    capacidad_kg,
    estado,
    conductor_id
  } = vehiculo;

  const [result] = await pool.query(
    `INSERT INTO vehiculos
    (placa, tipo, capacidad_kg, estado, conductor_id)
    VALUES (?, ?, ?, ?, ?)`,
    [placa, tipo, capacidad_kg, estado, conductor_id ?? null]
  );

  return findById(result.insertId);
}

// Eliminar un vehículo por su ID
async function remove(id) {
  const [result] = await pool.query(
    'DELETE FROM vehiculos WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}

module.exports = {
  findAll,
  findById,
  findByPlaca,
  create,
  remove
};
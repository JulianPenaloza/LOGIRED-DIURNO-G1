// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/envios.controller');

const router = Router();

// 1. Rutas de consulta (GET)
router.get('/', controller.listar);                               // listar todos los envíos
router.get('/codigo/:codigo', controller.obtenerPorCodigo);       // obtener un envío por código
router.get('/estado/:estado', controller.obtenerPorEstado);       // listar envíos por estado
router.get('/cliente/:cliente_id', controller.obtenerPorCliente); // listar envíos por cliente
router.get('/:id', controller.obtener);                           // obtener un envío por id (siempre al final de los GET)

// 2. Rutas de creación (POST)
router.post('/', controller.crear);                               // crear un envío

// 3. Rutas de eliminación (DELETE)
router.delete('/:id', controller.eliminarEnvio);                  // eliminar un envío

// Taller 2: agregar PUT /:id (actualizar)

module.exports = router;

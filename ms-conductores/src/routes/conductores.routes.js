// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/conductores.controller');

const router = Router();

router.get('/', controller.listar);      // listar todos los conductores
router.get('/:id', controller.obtener);  // obtener un conductor por id
router.post('/', controller.crear);      // crear un conductor

router.put('/:id', controller.actualizar); // actualizar un conductor por id
router.delete('/:id', controller.eliminar); // eliminar un conductor por id


module.exports = router;

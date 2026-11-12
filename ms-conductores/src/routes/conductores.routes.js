// =====================================================================
// CAPA DE PRESENTACIÓN (rutas)
// Asocia cada método HTTP + URI con una función del controlador.
// =====================================================================
const { Router } = require('express');
const controller = require('../controllers/conductores.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth.js');

const router = Router();

router.use(verificarToken); // todas las rutas requieren token válido


router.get('/', controller.listar);      // listar todos los conductores
router.get('/:id', controller.obtener);  // obtener un conductor por id
router.post('/', requiereRol('administrador'), controller.crear);      // crear un conductor

router.put('/:id', requiereRol('administrador', 'flota'), controller.actualizar); // actualizar un conductor por id
router.delete('/:id', requiereRol('administrador'), controller.eliminar); // eliminar un conductor por id


module.exports = router;

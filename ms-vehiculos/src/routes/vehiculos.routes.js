const express = require('express');
const router = express.Router();

const controller = require('../controllers/vehiculos.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');

router.use(verificarToken);

router.get('/', requiereRol('administrador', 'despacho', 'flota'), controller.listar);
router.get('/:id', requiereRol('administrador', 'despacho', 'flota'), controller.obtener);
router.post('/', requiereRol('administrador', 'flota'), controller.crear);
router.put('/:id', requiereRol('administrador', 'flota'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'flota'), controller.eliminar);

module.exports = router;

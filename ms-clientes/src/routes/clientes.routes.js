const { Router } = require('express');
const controller = require('../controllers/clientes.controller');
const { verificarToken, requiereRol } = require('../middlewares/auth');   // <- 1

const router = Router();

router.use(verificarToken);                                               // <- 2

router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', requiereRol('administrador', 'despacho'), controller.crear);   // <- 3
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);

module.exports = router;
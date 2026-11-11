const { Router } = require('express');
const controller = require('../controllers/envios.controller');
// 1. Importar los middlewares
const { verificarToken, requiereRol } = require('../middlewares/auth');

const router = Router();

// 2. Exigir token válido para TODAS las rutas de aquí hacia abajo
router.use(verificarToken);

// 3. Rutas de consulta (Cualquier rol con token válido puede entrar)
router.get('/', controller.listar);
router.get('/:id', controller.obtener);

// 4. Rutas de modificación (Solo roles autorizados)
router.post('/', requiereRol('administrador', 'despacho'), controller.crear);
router.put('/:id', requiereRol('administrador', 'despacho'), controller.actualizar);
router.delete('/:id', requiereRol('administrador', 'despacho'), controller.eliminar);

module.exports = router;
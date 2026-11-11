// =====================================================================
// CAPA DE SERVICIO (lógica de negocio)
// Aplica las reglas del negocio y las validaciones.
// No sabe nada de HTTP (req/res) ni de cómo se guardan los datos.
// =====================================================================
const repo = require('../repositories/envios.repository');
const { validarEnvio, construirEnvio } = require('../models/envio');
const HttpError = require('../utils/http-error');

// 1. IMPORTAR EL CLIENTE HTTP DE MS-CLIENTES
const clientesClient = require('../clients/clientes.client');

// 2. FUNCIÓN PARA COMPONER (mezclar los envíos con los datos del cliente)
async function componer(envios, token) {
  const ids = [...new Set(envios.map((e) => e.cliente_id))];
  const clientes = await clientesClient.clientesPorIds(ids, token);
  
  if (!clientes) {
    // degradación controlada si ms-clientes está caído
    return envios.map((e) => ({ ...e, cliente: null, aviso: 'ms-clientes no disponible' }));
  }
  return envios.map((e) => ({ ...e, cliente: clientes.get(e.cliente_id) || null }));
}

// 3. FUNCIONES DEL CRUD MODIFICADAS (ahora reciben 'token')
async function listar(filtros = {}, token) {
  // Componer la lista entera
  return componer(await repo.findAll(filtros), token);
}

async function obtener(id, token) {
  const envio = await repo.findById(id);
  if (!envio) throw new HttpError(404, `No existe el envío con id ${id}`);
  
  // Componer un solo envío
  const [compuesto] = await componer([envio], token);
  return compuesto;
}

async function crear(datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  // VALIDACIÓN RELACIONAL: ¿Existe el cliente en ms-clientes?
  if (!(await clientesClient.existeCliente(datos.cliente_id, token))) {
    throw new HttpError(400, `No existe el cliente con id ${datos.cliente_id}`);
  }

  const envio = construirEnvio(datos);

  if (envio.codigo && await repo.findByCodigo(envio.codigo)) {
    throw new HttpError(409, `Ya existe un envío con el código de guía ${envio.codigo}`);
  }

  const nuevo = await repo.create(envio);
  
  // Devolver el registro creado pero ya compuesto con los datos del cliente
  const [compuesto] = await componer([nuevo], token);
  return compuesto;
}

async function actualizar(id, datos, token) {
  const errores = validarEnvio(datos);
  if (errores.length > 0) throw new HttpError(400, 'Datos inválidos', errores);

  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el envío con id ${id}`);

  // VALIDACIÓN RELACIONAL: ¿Existe el cliente nuevo/actualizado en ms-clientes?
  if (!(await clientesClient.existeCliente(datos.cliente_id, token))) {
    throw new HttpError(400, `No existe el cliente con id ${datos.cliente_id}`);
  }

  const envio = construirEnvio(datos);

  if (envio.codigo && envio.codigo !== existente.codigo && await repo.findByCodigo(envio.codigo)) {
    throw new HttpError(409, `Ya existe un envío con el código de guía ${envio.codigo}`);
  }

  const actualizado = await repo.update(id, envio);
  
  // Devolver el registro actualizado pero ya compuesto
  const [compuesto] = await componer([actualizado], token);
  return compuesto;
}

async function eliminar(id) {
  // El eliminar no necesita componer ni validar en ms-clientes
  const existente = await repo.findById(id);
  if (!existente) throw new HttpError(404, `No existe el envío con id ${id}`);
  await repo.remove(id);
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
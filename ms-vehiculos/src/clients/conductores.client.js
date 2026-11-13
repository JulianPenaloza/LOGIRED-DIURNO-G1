const HttpError = require('../utils/http-error');

const URL_PREDETERMINADA = 'http://127.0.0.1:3004';
const TIMEOUT_MS = 3000;

function errorHttpRemoto(status) {
  if (status === 400) {
    return new HttpError(400, 'Solicitud inválida al consultar conductores');
  }
  if (status === 401) {
    return new HttpError(401, 'No autorizado por el servicio de conductores');
  }
  if (status === 403) {
    return new HttpError(403, 'Sin permiso en el servicio de conductores');
  }
  if (status === 404) {
    return new HttpError(404, 'No existe el recurso solicitado en conductores');
  }

  return new HttpError(503, 'El servicio de conductores no está disponible');
}

async function getJson(path, authorization) {
  if (typeof authorization !== 'string' || authorization.trim() === '') {
    throw new HttpError(401, 'Falta el token de acceso');
  }

  const baseUrl = (
    process.env.CONDUCTORES_SERVICE_URL || URL_PREDETERMINADA
  ).replace(/\/+$/, '');

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: 'GET',
      headers: { Authorization: authorization },
      signal: AbortSignal.timeout(TIMEOUT_MS)
    });
  } catch {
    throw new HttpError(503, 'El servicio de conductores no está disponible');
  }

  if (!response.ok) {
    throw errorHttpRemoto(response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new HttpError(503, 'Respuesta inválida del servicio de conductores');
  }
}

async function obtenerPorId(id, authorization) {
  let conductor;

  try {
    conductor = await getJson(
      `/conductores/${encodeURIComponent(id)}`,
      authorization
    );
  } catch (error) {
    if (error.status === 404) {
      throw new HttpError(400, `No existe el conductor con id ${id}`);
    }
    throw error;
  }

  if (
    !conductor ||
    typeof conductor !== 'object' ||
    Array.isArray(conductor) ||
    String(conductor.id) !== String(id)
  ) {
    throw new HttpError(503, 'Respuesta inválida del servicio de conductores');
  }

  return conductor;
}

async function obtenerPorIds(ids, authorization) {
  const query = new URLSearchParams({ ids: ids.join(',') });
  const conductores = await getJson(`/conductores?${query}`, authorization);

  if (
    !Array.isArray(conductores) ||
    conductores.some((conductor) =>
      !conductor ||
      typeof conductor !== 'object' ||
      Array.isArray(conductor) ||
      !Number.isInteger(Number(conductor.id)) ||
      Number(conductor.id) <= 0
    )
  ) {
    throw new HttpError(503, 'Respuesta inválida del servicio de conductores');
  }

  return conductores;
}

module.exports = { obtenerPorId, obtenerPorIds };

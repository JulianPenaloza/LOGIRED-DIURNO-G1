// =====================================================================
// API: TODAS las llamadas al API Gateway (/api) pasan por aquí.
//   api('/envios')                                  → GET
//   api('/envios', { method: 'POST', body: {...} }) → POST
// Agrega el token, convierte la respuesta en JSON y, si hay error,
// lanza un ErrorApi con el código y el mensaje del microservicio.
// =====================================================================
class ErrorApi extends Error {
  constructor(status, mensaje, detalles) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles || [];
  }
}

async function api(ruta, opciones = {}) {
  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`/api${ruta}`, {
      method: opciones.method || 'GET',
      headers: cabeceras,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch (error) {
    // No hubo respuesta: el servidor/gateway está apagado
    throw new ErrorApi(0, 'No hay conexión con el servidor. Verifica que los servicios estén activos.');
  }

  if (respuesta.status === 401 && ruta !== '/usuarios/login') {
    cerrarSesion();                    // sin sesión o token vencido: volver a entrar
    return null;
  }
  const datos = respuesta.status === 204 ? null : await respuesta.json();
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos.error, datos.detalles);
  return datos;
}
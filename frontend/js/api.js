// =====================================================================
// API: usa el gateway del mismo origen de forma predeterminada.
// En desarrollo directo, { servicio: 'clientes' } selecciona su URL local.
// Las rutas existentes sin servicio explícito conservan el gateway.
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

function servicioDeRuta(ruta) {
  const rutaSinConsulta = ruta.split('?')[0];
  return Object.keys(API_SERVICIOS).find((servicio) =>
    rutaSinConsulta === `/${servicio}` || rutaSinConsulta.startsWith(`/${servicio}/`)
  ) || null;
}

async function api(ruta, opciones = {}) {
  const servicio = opciones.servicio || servicioDeRuta(ruta);
  if (servicio && !API_SERVICIOS[servicio]) {
    throw new ErrorApi(0, `Microservicio no configurado: ${servicio}`);
  }

  // El gateway atiende también rutas existentes como /envios. En modo local,
  // se usa el servicio seleccionado o inferido cuando tiene URL configurada.
  const usarGateway = API_USAR_GATEWAY || !servicio;
  const urlBase = usarGateway ? API_USUARIOS : API_SERVICIOS[servicio];

  const token = sessionStorage.getItem('token');
  const cabeceras = { 'Content-Type': 'application/json' };
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${urlBase}${ruta}`, {
      method: opciones.method || 'GET',
      headers: cabeceras,
      body: opciones.body ? JSON.stringify(opciones.body) : undefined,
    });
  } catch (error) {
    if (usarGateway) {
      throw new ErrorApi(0, 'No hay conexión con el servidor. Verifica que los servicios estén activos.');
    }
    throw new ErrorApi(0, `No hay conexión con ms-${servicio}. ¿Está corriendo en ${urlBase}?`);
  }

  if (respuesta.status === 401 && ruta !== '/usuarios/login') {
    cerrarSesion();                    // sin sesión o token vencido: volver a entrar
    return null;
  }
  const datos = respuesta.status === 204 ? null : await respuesta.json();
  if (!respuesta.ok) throw new ErrorApi(respuesta.status, datos.error, datos.detalles);
  return datos;
}

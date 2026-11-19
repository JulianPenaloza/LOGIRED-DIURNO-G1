// =====================================================================
// PANTALLA DE CONDUCTORES (todos los roles consultan)
// Permisos según las rutas de ms-conductores:
//   crear y eliminar → administrador
//   editar           → administrador y flota
// Usa: GET /conductores, GET /conductores?categoria_licencia=&sede=,
//      POST /conductores, PUT /conductores/:id, DELETE /conductores/:id
// =====================================================================
const yo = exigirSesion();
const PUEDE_CREAR = Boolean(yo) && yo.rol === 'administrador';
const PUEDE_ELIMINAR = PUEDE_CREAR;
const PUEDE_EDITAR = Boolean(yo) && ['administrador', 'flota'].includes(yo.rol);
let conductores = [];

// El backend valida en minúscula ('c2', 'c3'); en pantalla se muestran en mayúscula
const LICENCIAS = ['c2', 'c3'];
const SEDES = ['cali', 'medellin', 'bogota'];

const camposConductor = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'cedula', etiqueta: 'Cédula', ayuda: 'Exactamente 10 dígitos' },
  { nombre: 'categoria_licencia', etiqueta: 'Categoría de licencia', tipo: 'select',
    opciones: LICENCIAS.map((l) => ({ valor: l, texto: l.toUpperCase() })) },
  { nombre: 'telefono', etiqueta: 'Teléfono', ayuda: 'Solo números, de 7 a 10 dígitos' },
  { nombre: 'sede', etiqueta: 'Sede', tipo: 'select',
    opciones: SEDES.map((s) => ({ valor: s, texto: s })) },
];

function pintar(filtros) {
  const partes = [];
  if (filtros.categoria_licencia) partes.push(`licencia ${filtros.categoria_licencia.toUpperCase()}`);
  if (filtros.sede) partes.push(`sede ${filtros.sede}`);
  const sufijo = partes.length ? ` (${partes.join(', ')})` : '';
  document.getElementById('resumen').textContent = `${conductores.length} conductores${sufijo}`;
  document.getElementById('lista').innerHTML = conductores.map((c) => `
    <tr>
      <td>${esc(c.nombre)}</td>
      <td>${esc(c.cedula)}</td>
      <td><span class="etiqueta-rol">${esc(String(c.categoria_licencia).toUpperCase())}</span></td>
      <td>${esc(c.telefono)}</td>
      <td>${esc(c.sede)}</td>
      <td class="acciones">
        ${PUEDE_EDITAR ? `<button class="boton boton-suave" data-editar="${c.id}">Editar</button>` : ''}
        ${PUEDE_ELIMINAR ? `<button class="boton boton-peligro" data-eliminar="${c.id}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

async function cargar() {
  const filtros = {
    categoria_licencia: document.getElementById('filtro-licencia').value,
    sede: document.getElementById('filtro-sede').value,
  };
  const consulta = new URLSearchParams(
    Object.entries(filtros).filter(([, valor]) => valor)).toString();
  try {
    const datos = await api(`/conductores${consulta ? `?${consulta}` : ''}`);
    if (datos === null) return;             // sin sesión: ya se volvió al login
    conductores = datos;
    pintar(filtros);
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de conductores.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Crear conductor', camposConductor, {}, 'Crear conductor');
  if (!datos) return;
  try {
    await api('/conductores', { method: 'POST', body: datos });
    mostrarMensaje(`Conductor creado: ${datos.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(c) {
  const datos = await pedirDatos('Editar conductor', camposConductor, c);
  if (!datos) return;
  try {
    await api(`/conductores/${c.id}`, { method: 'PUT', body: datos });
    mostrarMensaje('Cambios guardados');
    cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(c) {
  if (!(await confirmar(`¿Eliminar a ${c.nombre}?`, 'Eliminar conductor'))) return;
  try {
    await api(`/conductores/${c.id}`, { method: 'DELETE' });
    mostrarMensaje(`Conductor eliminado: ${c.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  // Quien no tiene permiso no ve el botón. Si aun así se pidiera la
  // operación, el 403 del microservicio se muestra.
  document.getElementById('nuevo').style.display = PUEDE_CREAR ? '' : 'none';
  document.getElementById('nuevo').onclick = crear;
  document.getElementById('filtro-licencia').onchange = cargar;
  document.getElementById('filtro-sede').onchange = cargar;
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const c = conductores.find((x) => x.id === Number(idEditar || idEliminar));
    if (c && idEditar) editar(c);
    if (c && idEliminar) eliminar(c);
  };
  cargar();
}

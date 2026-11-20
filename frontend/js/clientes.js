// =====================================================================
// PANTALLA DE CLIENTES (todos los roles consultan; administrador y
// despacho también crean, editan y eliminan)
// Usa: GET /clientes, GET /clientes?ciudad=, POST /clientes,
//      PUT /clientes/:id, DELETE /clientes/:id
// =====================================================================
const yo = exigirSesion();
const PUEDE_ESCRIBIR = Boolean(yo) && ['administrador', 'despacho'].includes(yo.rol);
let clientes = [];

const camposCliente = [
  { nombre: 'nombre', etiqueta: 'Nombre' },
  { nombre: 'documento', etiqueta: 'Documento', ayuda: 'Solo números, de 6 a 15 dígitos' },
  { nombre: 'telefono', etiqueta: 'Teléfono', ayuda: 'Solo números, de 7 a 10 dígitos' },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email' },
  { nombre: 'ciudad', etiqueta: 'Ciudad' },
];

function pintar(ciudad) {
  const sufijo = ciudad ? ` en ${ciudad}` : '';
  document.getElementById('resumen').textContent = `${clientes.length} clientes${sufijo}`;
  document.getElementById('lista').innerHTML = clientes.map((c) => `
    <tr>
      <td class="id">${esc(c.id)}</td>
      <td>${esc(c.nombre)}</td>
      <td>${esc(c.documento)}</td>
      <td>${esc(c.telefono)}</td>
      <td>${esc(c.email)}</td>
      <td>${esc(c.ciudad)}</td>
      <td class="acciones">${PUEDE_ESCRIBIR ? `
        <button class="boton boton-suave" data-editar="${c.id}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${c.id}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

async function cargar() {
  const ciudad = document.getElementById('filtro-ciudad').value.trim();
  const consulta = ciudad ? `?ciudad=${encodeURIComponent(ciudad)}` : '';
  try {
    const datos = await api(`/clientes${consulta}`, { servicio: 'clientes' });
    if (datos === null) return;             // sin sesión: ya se volvió al login
    clientes = datos;
    pintar(ciudad);
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de clientes.';
    mostrarError(error);
  }
}

async function crear() {
  const datos = await pedirDatos('Crear cliente', camposCliente, {}, 'Crear cliente');
  if (!datos) return;
  try {
    await api('/clientes', { method: 'POST', body: datos, servicio: 'clientes' });
    mostrarMensaje(`Cliente creado: ${datos.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(c) {
  const datos = await pedirDatos('Editar cliente', camposCliente, c);
  if (!datos) return;
  try {
    await api(`/clientes/${c.id}`, { method: 'PUT', body: datos, servicio: 'clientes' });
    mostrarMensaje('Cambios guardados');
    cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(c) {
  if (!(await confirmar(`¿Eliminar a ${c.nombre}?`, 'Eliminar cliente'))) return;
  try {
    await api(`/clientes/${c.id}`, { method: 'DELETE', servicio: 'clientes' });
    mostrarMensaje(`Cliente eliminado: ${c.nombre}`);
    cargar();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  // El rol sin permiso de escritura no ve el botón de crear. Si aun así
  // llegara a pedirse la operación, el 403 del microservicio se muestra.
  document.getElementById('nuevo').style.display = PUEDE_ESCRIBIR ? '' : 'none';
  document.getElementById('nuevo').onclick = crear;
  document.getElementById('buscar').onclick = cargar;
  document.getElementById('filtro-ciudad').onkeydown = (evento) => {
    if (evento.key === 'Enter') cargar();
  };
  document.getElementById('lista').onclick = (evento) => {
    const { editar: idEditar, eliminar: idEliminar } = evento.target.dataset;
    const c = clientes.find((x) => x.id === Number(idEditar || idEliminar));
    if (c && idEditar) editar(c);
    if (c && idEliminar) eliminar(c);
  };
  cargar();
}

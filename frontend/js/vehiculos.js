// =====================================================================
// PANTALLA DE VEHÍCULOS
// Consulta ms-vehiculos y usa ms-conductores para asignar conductores.
// Los tres roles consultan; solo administrador y flota escriben.
// =====================================================================
const yo = exigirSesion();
const PUEDE_ESCRIBIR = Boolean(yo) && ['administrador', 'flota'].includes(yo.rol);
let vehiculos = [];

const TIPOS = [
  { valor: 'moto', texto: 'Moto' },
  { valor: 'furgon', texto: 'Furgón' },
  { valor: 'camion', texto: 'Camión' },
];

const ESTADOS = [
  { valor: 'disponible', texto: 'Disponible' },
  { valor: 'en_ruta', texto: 'En ruta' },
  { valor: 'mantenimiento', texto: 'Mantenimiento' },
];

const ETIQUETAS_TIPO = Object.fromEntries(TIPOS.map(({ valor, texto }) => [valor, texto]));
const ETIQUETAS_ESTADO = Object.fromEntries(ESTADOS.map(({ valor, texto }) => [valor, texto]));

function nombreConductor(vehiculo) {
  if (vehiculo.conductor && vehiculo.conductor.nombre) {
    return esc(vehiculo.conductor.nombre);
  }
  return vehiculo.conductor_id == null ? 'Sin asignar' : 'No disponible';
}

function pintar() {
  document.getElementById('resumen').textContent =
    `${vehiculos.length} vehículos`;

  if (vehiculos.length === 0) {
    document.getElementById('lista').innerHTML =
      '<tr><td colspan="6">No hay vehículos registrados.</td></tr>';
    return;
  }

  document.getElementById('lista').innerHTML = vehiculos.map((vehiculo) => `
    <tr>
      <td>${esc(vehiculo.placa)}</td>
      <td>${esc(ETIQUETAS_TIPO[vehiculo.tipo] || vehiculo.tipo)}</td>
      <td>${esc(vehiculo.capacidad_kg)}</td>
      <td>${esc(ETIQUETAS_ESTADO[vehiculo.estado] || vehiculo.estado)}</td>
      <td>${nombreConductor(vehiculo)}</td>
      <td class="acciones">${PUEDE_ESCRIBIR ? `
        <button class="boton boton-suave" data-editar="${esc(vehiculo.id)}">Editar</button>
        <button class="boton boton-peligro" data-eliminar="${esc(vehiculo.id)}">Eliminar</button>` : ''}
      </td>
    </tr>`).join('');
}

async function cargar() {
  try {
    const datos = await api('/vehiculos', { servicio: 'vehiculos' });
    if (datos === null) return;
    if (!Array.isArray(datos)) {
      throw new ErrorApi(502, 'Respuesta inválida de ms-vehiculos');
    }
    vehiculos = datos;
    pintar();
  } catch (error) {
    document.getElementById('resumen').textContent = 'No se pudo cargar la lista de vehículos.';
    mostrarError(error);
  }
}

async function cargarConductores() {
  try {
    const datos = await api('/conductores', { servicio: 'conductores' });
    if (datos === null) return null;
    if (!Array.isArray(datos)) {
      throw new ErrorApi(502, 'Respuesta inválida de ms-conductores');
    }
    return datos;
  } catch (error) {
    mostrarError(error);
    return null;
  }
}

function camposVehiculo(conductores) {
  return [
    { nombre: 'placa', etiqueta: 'Placa' },
    { nombre: 'tipo', etiqueta: 'Tipo', tipo: 'select', opciones: TIPOS },
    { nombre: 'capacidad_kg', etiqueta: 'Capacidad (kg)', ayuda: 'Número mayor que cero' },
    { nombre: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ESTADOS },
    {
      nombre: 'conductor_id',
      etiqueta: 'Conductor',
      tipo: 'select',
      opciones: [
        { valor: '', texto: 'Sin conductor asignado' },
        ...conductores.map((conductor) => ({
          valor: conductor.id,
          texto: `${conductor.nombre} · ${conductor.categoria_licencia}`,
        })),
      ],
    },
  ];
}

function construirDatos(datos) {
  const capacidad = Number(datos.capacidad_kg);
  if (!Number.isFinite(capacidad) || capacidad <= 0) {
    mostrarMensaje('La capacidad debe ser un número mayor que cero.', 'error');
    return null;
  }

  const conductorId = datos.conductor_id === '' ? null : Number(datos.conductor_id);
  if (conductorId !== null && (!Number.isInteger(conductorId) || conductorId <= 0)) {
    mostrarMensaje('Seleccione un conductor válido.', 'error');
    return null;
  }

  return {
    placa: datos.placa,
    tipo: datos.tipo,
    capacidad_kg: capacidad,
    estado: datos.estado,
    conductor_id: conductorId,
  };
}

async function crear() {
  if (!PUEDE_ESCRIBIR) return;
  const conductores = await cargarConductores();
  if (conductores === null) return;

  const datos = await pedirDatos(
    'Registrar vehículo',
    camposVehiculo(conductores),
    { tipo: 'moto', estado: 'disponible', conductor_id: '' },
    'Registrar vehículo'
  );
  if (!datos) return;

  const vehiculo = construirDatos(datos);
  if (!vehiculo) return;

  try {
    await api('/vehiculos', {
      method: 'POST',
      body: vehiculo,
      servicio: 'vehiculos',
    });
    mostrarMensaje(`Vehículo registrado: ${vehiculo.placa}`);
    await cargar();
  } catch (error) { mostrarError(error); }
}

async function editar(vehiculoActual) {
  if (!PUEDE_ESCRIBIR) return;
  const conductores = await cargarConductores();
  if (conductores === null) return;

  const datos = await pedirDatos(
    'Editar vehículo',
    camposVehiculo(conductores),
    {
      placa: vehiculoActual.placa,
      tipo: vehiculoActual.tipo,
      capacidad_kg: String(vehiculoActual.capacidad_kg),
      estado: vehiculoActual.estado,
      conductor_id: vehiculoActual.conductor_id == null
        ? ''
        : String(vehiculoActual.conductor_id),
    },
    'Guardar cambios'
  );
  if (!datos) return;

  const vehiculo = construirDatos(datos);
  if (!vehiculo) return;

  try {
    await api(`/vehiculos/${vehiculoActual.id}`, {
      method: 'PUT',
      body: vehiculo,
      servicio: 'vehiculos',
    });
    mostrarMensaje('Cambios guardados.');
    await cargar();
  } catch (error) { mostrarError(error); }
}

async function eliminar(vehiculo) {
  if (!PUEDE_ESCRIBIR) return;
  if (!(await confirmar(`¿Eliminar el vehículo ${vehiculo.placa}?`, 'Eliminar vehículo'))) return;

  try {
    await api(`/vehiculos/${vehiculo.id}`, {
      method: 'DELETE',
      servicio: 'vehiculos',
    });
    mostrarMensaje(`Vehículo eliminado: ${vehiculo.placa}`);
    await cargar();
  } catch (error) { mostrarError(error); }
}

if (yo) {
  pintarEncabezado(yo);
  document.getElementById('enlace-usuarios').hidden = yo.rol !== 'administrador';

  const botonNuevo = document.getElementById('nuevo');
  botonNuevo.hidden = !PUEDE_ESCRIBIR;
  botonNuevo.onclick = crear;
  document.getElementById('actualizar').onclick = cargar;
  document.getElementById('lista').onclick = (evento) => {
    const boton = evento.target.closest('button');
    if (!boton) return;

    const vehiculo = vehiculos.find((item) => item.id === Number(
      boton.dataset.editar || boton.dataset.eliminar
    ));
    if (!vehiculo) return;
    if (boton.dataset.editar) editar(vehiculo);
    if (boton.dataset.eliminar) eliminar(vehiculo);
  };

  cargar();
}

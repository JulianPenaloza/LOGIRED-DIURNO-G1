// 1. Verificar sesión y leer usuario
const token = sessionStorage.getItem('token');
const usuario = JSON.parse(sessionStorage.getItem('usuario') || 'null');

if (!token || !usuario) {
  location.href = '/login.html';
}

// Mostrar nombre y rol en el encabezado
document.getElementById('info-usuario').textContent = `${usuario.nombre} (${usuario.rol}) `;

// Botón cerrar sesión
function cerrarSesion() {
  sessionStorage.clear();
  location.href = '/login.html';
}
document.getElementById('btn-salir').addEventListener('click', cerrarSesion);

// 2. Control visual por rol: flota solo consulta, no crea/edita/elimina
const puedeEditar = usuario.rol === 'administrador' || usuario.rol === 'despacho';
if (!puedeEditar) {
  document.getElementById('seccion-formulario').style.display = 'none';
  document.getElementById('col-acciones').style.display = 'none';
}

// Funciones para mostrar/ocultar errores en pantalla
const cajaError = document.getElementById('mensaje-error');
function mostrarError(msg) {
  cajaError.textContent = msg;
  cajaError.style.display = 'block';
}
function limpiarError() {
  cajaError.textContent = '';
  cajaError.style.display = 'none';
}

// 3. Listar envíos (una sola petición a /api/envios)
async function cargarEnvios() {
  limpiarError();
  try {
    const envios = await api('/envios');
    if (!envios) return;

    const tbody = document.getElementById('tabla-envios');
    tbody.innerHTML = '';

    envios.forEach((e) => {
      // Datos compuestos que ya vienen del backend (sin llamar a ms-clientes desde aquí)
      const textoCliente = e.cliente
        ? `${e.cliente.nombre} (${e.cliente.ciudad})`
        : `<span class="aviso">${e.aviso || 'Cliente no disponible'}</span>`;

      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${e.id}</td>
        <td>${e.codigo}</td>
        <td>${e.origen}</td>
        <td>${e.destino}</td>
        <td>${e.estado}</td>
        <td>${textoCliente}</td>
        ${puedeEditar ? `
          <td>
            <button onclick="prepararEdicion(${e.id}, '${e.codigo}', '${e.origen}', '${e.destino}', '${e.estado}', ${e.cliente_id})">Editar</button>
            <button onclick="eliminarEnvio(${e.id})">Eliminar</button>
          </td>
        ` : ''}
      `;
      tbody.appendChild(fila);
    });
  } catch (err) {
    mostrarError(`Error al cargar envíos: ${err.message}`);
  }
}

// 4. Crear o Actualizar envío
document.getElementById('form-envio').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  limpiarError();

  const id = document.getElementById('envio-id').value;
  const datos = {
    codigo: document.getElementById('codigo').value.trim(),
    origen: document.getElementById('origen').value.trim(),
    destino: document.getElementById('destino').value.trim(),
    estado: document.getElementById('estado').value,
    cliente_id: Number(document.getElementById('cliente_id').value),
    peso: Number(document.getElementById('peso').value),
  };

  try {
    if (id) {
      await api(`/envios/${id}`, { method: 'PUT', body: datos });
    } else {
      await api('/envios', { method: 'POST', body: datos });
    }
    document.getElementById('form-envio').reset();
    document.getElementById('envio-id').value = '';
    document.getElementById('titulo-form').textContent = 'Nuevo envío';
    cargarEnvios();
  } catch (err) {
    // Muestra 400, 403, 409 o 503 (cuando ms-clientes está caído)
    mostrarError(`Error (${err.status || ''}): ${err.message}`);
  }
});

// Cargar datos en el formulario para editar
function prepararEdicion(id, codigo, origen, destino, estado, clienteId) {
  document.getElementById('envio-id').value = id;
  document.getElementById('codigo').value = codigo;
  document.getElementById('origen').value = origen;
  document.getElementById('destino').value = destino;
  document.getElementById('estado').value = estado;
  document.getElementById('cliente_id').value = clienteId;
  document.getElementById('titulo-form').textContent = `Editando envío #${id}`;
}

// 5. Eliminar envío
async function eliminarEnvio(id) {
  if (!confirm(`¿Eliminar el envío #${id}?`)) return;
  limpiarError();
  try {
    await api(`/envios/${id}`, { method: 'DELETE' });
    cargarEnvios();
  } catch (err) {
    mostrarError(`Error al eliminar: ${err.message}`);
  }
}

// Arrancar cargando la tabla
cargarEnvios();

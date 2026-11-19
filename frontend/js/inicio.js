// =====================================================================
// PÁGINA DE INICIO POR ROL (admin.html, despacho.html, flota.html)
// La misma lógica para los tres: la página declara su rol en
// <body data-rol="..."> y aquí se dibuja la tabla de permisos del rol
// a partir de MODULOS (config.js).
// =====================================================================
const yo = exigirSesion(document.body.dataset.rol);
const ACCIONES = ['consultar', 'crear', 'editar', 'eliminar'];

function pintarInicio() {
  const modulos = Object.values(MODULOS).filter((m) => m.permisos[yo.rol]);
  document.getElementById('resumen').textContent =
    `Tiene acceso a ${modulos.length} módulos. Las operaciones marcadas con “—” no están permitidas para su rol.`;

  document.getElementById('lista').innerHTML = modulos.map((m) => {
    const permisos = m.permisos[yo.rol];
    const celdas = ACCIONES.map((a) =>
      `<td>${permisos.includes(a) ? 'Sí' : '<span class="sub">—</span>'}</td>`).join('');
    const abrir = m.pagina
      ? `<a class="boton" href="/${m.pagina}">Abrir</a>`
      : '<span class="sub">Próximamente</span>';
    return `
      <tr>
        <td><strong>${esc(m.nombre)}</strong><br><span class="sub">${esc(m.descripcion)}</span></td>
        ${celdas}
        <td class="acciones">${abrir}</td>
      </tr>`;
  }).join('');
}

if (yo) {
  pintarEncabezado(yo);
  pintarInicio();
}

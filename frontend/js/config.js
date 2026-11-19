// =====================================================================
// CONFIGURACIÓN DEL FRONTEND
// En despliegue, la API se consume por el gateway en el mismo origen.
// Para desarrollo local puede cambiarse API_USAR_GATEWAY a false.
// =====================================================================
const API_USUARIOS = '/api';

const API_USUARIOS_LOCAL = 'http://localhost:3001';
const API_CLIENTES = 'http://localhost:3002';
const API_CONDUCTORES = 'http://localhost:3004';
const API_VEHICULOS = 'http://localhost:3005';

const API_SERVICIOS = {
  usuarios: API_USUARIOS_LOCAL,
  clientes: API_CLIENTES,
  conductores: API_CONDUCTORES,
  vehiculos: API_VEHICULOS,
};

const API_USAR_GATEWAY = true;

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: '/admin.html',
  despacho: '/despacho.html',
  flota: '/flota.html',
};

const ROLES = ['administrador', 'despacho', 'flota'];

// ---------------------------------------------------------------------
// MATRIZ DE PERMISOS (Taller 2 M3, sección 5 y archivos de rutas)
// Qué puede hacer cada rol en cada microservicio. Es solo la parte
// visual: quien realmente decide es cada microservicio (401 / 403).
// pagina: null = pantalla todavía no construida (se muestra "Próximamente").
// ---------------------------------------------------------------------
const TODO = ['consultar', 'crear', 'editar', 'eliminar'];
const MODULOS = {
  usuarios: {
    nombre: 'Usuarios', pagina: 'usuarios.html',
    descripcion: 'Cuentas y roles de acceso (ms-usuarios)',
    permisos: { administrador: TODO },
  },
  clientes: {
    nombre: 'Clientes', pagina: 'clientes.html',
    descripcion: 'Empresas y personas que envían paquetes (ms-clientes)',
    permisos: { administrador: TODO, despacho: TODO, flota: ['consultar'] },
  },
  envios: {
    nombre: 'Envíos', pagina: 'envios.html',
    descripcion: 'Guías de envío y su estado (ms-envios)',
    permisos: { administrador: TODO, despacho: TODO, flota: ['consultar'] },
  },
  conductores: {
    nombre: 'Conductores', pagina: 'conductores.html',
    descripcion: 'Conductores y categoría de licencia (ms-conductores)',
    // Según conductores.routes.js: crear y eliminar solo administrador;
    // editar administrador y flota.
    permisos: { administrador: TODO, despacho: ['consultar'], flota: ['consultar', 'editar'] },
  },
  vehiculos: {
    nombre: 'Vehículos', pagina: null,
    descripcion: 'Flota y conductor asignado (ms-vehiculos)',
    permisos: { administrador: TODO, despacho: ['consultar'], flota: TODO },
  },
};

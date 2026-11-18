// =====================================================================
// CONFIGURACIÓN DEL FRONTEND
// Detrás del gateway de Apache, la API vive en '/api' (mismo origen).
// =====================================================================
const API_USUARIOS = '/api';

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: '/admin.html',
  despacho: '/despacho.html',
  flota: '/flota.html',
};

const ROLES = ['administrador', 'despacho', 'flota'];

// =====================================================================
// CONFIGURACIÓN DEL FRONTEND
// Dirección de ms-usuarios. En el Taller 3, detrás del gateway, pasa a ser
// '/api' (misma dirección que el frontend) y CORS deja de hacer falta.
// =====================================================================
const API_USUARIOS = 'http://localhost:3001';

// Página de inicio de cada rol (a dónde lleva el login)
const PAGINA_POR_ROL = {
  administrador: 'usuarios.html',
  bibliotecario: 'perfil.html',
  lector: 'perfil.html',
};

const ROLES = ['administrador', 'bibliotecario', 'lector'];

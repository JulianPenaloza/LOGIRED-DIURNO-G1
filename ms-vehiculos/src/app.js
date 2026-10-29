
const express = require('express');
const vehiculosRoutes = require('./routes/vehiculos.routes');

const app = express();

app.use(express.json());

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    servicio: 'ms-vehiculos',
    estado: 'ok'
  });
});

// Rutas del recurso vehículos
app.use('/vehiculos', vehiculosRoutes);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejo centralizado de errores
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'El cuerpo de la petición no es un JSON válido'
    });
  }

  const status = err.status || 500;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.message,
    detalles: err.detalles
  });
});

module.exports = app;

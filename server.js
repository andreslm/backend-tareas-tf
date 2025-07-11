const express = require('express');
const cors = require('cors');
const pool = require('./models/db');
const authRoutes = require('./routes/auth');
const bcrypt = require('bcryptjs');
const usuariosRoutes = require('./routes/usuarios');
const ideasRoutes = require('./routes/ideas');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/ideas', ideasRoutes);


// Rutas
const actividadesRoutes = require('./routes/actividades');
app.use('/api/actividades', actividadesRoutes);

app.get('/', (req, res) => {
  res.send('API Tareas Telcofiber funcionando ✅');
});


// Test de conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión a PostgreSQL:', err);
  } else {
    console.log('✅ Conectado a PostgreSQL:', res.rows[0]);
  }
});

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en puerto ${PORT}`));

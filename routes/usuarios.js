const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const bcrypt = require('bcryptjs');


// POST - Crear nuevo usuario
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  try {
    const existe = await pool.query('SELECT * FROM usuarios_actividad WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios_actividad (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol`,
      [nombre, email, hash, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
});

// GET - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, email, rol FROM usuarios_actividad ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// PUT - Editar usuario
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol, password } = req.body;

  try {
    const existe = await pool.query('SELECT * FROM usuarios_actividad WHERE email = $1 AND id != $2', [email, id]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado por otro usuario' });
    }

    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        `UPDATE usuarios_actividad SET nombre = $1, email = $2, rol = $3, password = $4 WHERE id = $5`,
        [nombre, email, rol, hash, id]
      );
    } else {
      await pool.query(
        `UPDATE usuarios_actividad SET nombre = $1, email = $2, rol = $3 WHERE id = $4`,
        [nombre, email, rol, id]
      );
    }

    res.json({ message: 'Usuario actualizado' });
  } catch (err) {
    console.error('Error al editar usuario:', err);
    res.status(500).json({ message: 'Error al editar usuario' });
  }
});


// DELETE - Eliminar usuario
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM usuarios_actividad WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
});

// GET - Obtener usuarios con rol 'usuario' para asignación
router.get('/responsables', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, rol FROM usuarios_actividad ORDER BY nombre`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener responsables:', error);
    res.status(500).json({ message: 'Error al obtener responsables' });
  }
});



module.exports = router;

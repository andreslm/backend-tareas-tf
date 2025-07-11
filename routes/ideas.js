// backend/routes/ideas.js
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// Obtener todas las ideas
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ideas ORDER BY fecha_creacion DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener ideas:', error);
    res.status(500).json({ message: 'Error al obtener ideas' });
  }
});

// POST - Crear nueva idea
router.post('/', async (req, res) => {
  const { titulo, descripcion, autor } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO ideas (titulo, descripcion, autor)
       VALUES ($1, $2, $3) RETURNING *`,
      [titulo, descripcion, autor]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear idea:', error);
    res.status(500).json({ message: 'Error al crear idea' });
  }
});

// PUT - Cambiar estado (asignar o descartar)
router.put('/:id/estado', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'asignada' o 'descartada'
  try {
    await pool.query(
      `UPDATE ideas SET estado = $1 WHERE id = $2`,
      [estado, id]
    );
    res.json({ message: `Idea actualizada a estado: ${estado}` });
  } catch (error) {
    console.error('Error al actualizar estado de la idea:', error);
    res.status(500).json({ message: 'Error al actualizar idea' });
  }
});

router.put('/:id/descartar', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE ideas SET estado = $1 WHERE id = $2', ['descartada', id]);
    res.json({ message: 'Idea descartada' });
  } catch (err) {
    console.error('Error al descartar idea:', err);
    res.status(500).json({ message: 'Error al descartar idea' });
  }
});

router.put('/:id/asignar', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE ideas SET estado = $1 WHERE id = $2', ['asignada', id]);
    res.json({ message: 'Idea asignada' });
  } catch (err) {
    console.error('Error al asignar idea:', err);
    res.status(500).json({ message: 'Error al asignar idea' });
  }
});


module.exports = router;

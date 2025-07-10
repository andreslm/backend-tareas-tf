const express = require('express');
const router = express.Router();
const pool = require('../models/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET - Listar todas las actividades
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM actividades ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ message: 'Error al obtener actividades' });
  }
});

// POST - Crear nueva actividad
router.post('/', async (req, res) => {
  try {
    const { titulo, area, responsable, fecha_entrega } = req.body;
    const fecha_asignacion = new Date(); // Fecha actual

    const result = await pool.query(
      `INSERT INTO actividades (titulo, area, responsable, fecha_entrega, fecha_asignacion)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titulo, area, responsable, fecha_entrega, fecha_asignacion]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({ message: 'Error al crear actividad' });
  }
});

// PUT - Editar actividad
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, area, responsable, fecha_entrega } = req.body;

    const result = await pool.query(
      `UPDATE actividades
       SET titulo = $1, area = $2, responsable = $3, fecha_entrega = $4
       WHERE id = $5 RETURNING *`,
      [titulo, area, responsable, fecha_entrega, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al editar actividad:', error);
    res.status(500).json({ message: 'Error al editar actividad' });
  }
});

// DELETE - Eliminar actividad
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM actividades WHERE id = $1', [id]);
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    console.error('Error al eliminar actividad:', error);
    res.status(500).json({ message: 'Error al eliminar actividad' });
  }
});

router.put('/:id/entregar', upload.single('archivo'), async (req, res) => {
  const { id } = req.params;
  const { nota_entrega } = req.body;
  const evidencia = req.file ? req.file.filename : null;
  const fecha_entregada = new Date();

  try {
    await pool.query(
      'UPDATE actividades SET estado = $1, nota_entrega = $2, fecha_entregada = $3, evidencia_entrega = $4 WHERE id = $5',
      ['entregada', nota_entrega, fecha_entregada, evidencia, id]
    );
    res.send({ message: 'Actividad entregada con evidencia' });
  } catch (error) {
    console.error('Error al entregar actividad:', error);
    res.status(500).json({ message: 'Error al entregar actividad' });
  }
});


module.exports = router;

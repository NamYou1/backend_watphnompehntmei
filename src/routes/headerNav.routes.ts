import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

const router = Router();

/**
 * @swagger
 * /api/header-nav:
 *   get:
 *     summary: Get all header navigation items
 *     tags: [Header Nav]
 *     responses:
 *       200:
 *         description: List of nav items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HeaderNav'
 *   post:
 *     summary: Create a nav item
 *     tags: [Header Nav]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, label_km, path]
 *             properties:
 *               label:      { type: string }
 *               label_km:   { type: string }
 *               path:       { type: string }
 *               sort_order: { type: integer }
 *               is_active:  { type: boolean }
 *     responses:
 *       201:
 *         description: Created nav item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderNav'
 * /api/header-nav/{id}:
 *   get:
 *     summary: Get nav item by ID
 *     tags: [Header Nav]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: HeaderNav object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderNav'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a nav item
 *     tags: [Header Nav]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, label_km, path]
 *             properties:
 *               label:      { type: string }
 *               label_km:   { type: string }
 *               path:       { type: string }
 *               sort_order: { type: integer }
 *               is_active:  { type: boolean }
 *     responses:
 *       200:
 *         description: Updated nav item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HeaderNav'
 *   delete:
 *     summary: Delete a nav item
 *     tags: [Header Nav]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/header-nav
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM header_nav ORDER BY sort_order ASC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/header-nav/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM header_nav WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Nav item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/header-nav
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { label, label_km, path, sort_order, is_active } = req.body;
    if (!label || !label_km || !path) {
      return res.status(400).json({ message: 'label, label_km, and path are required' });
    }
    const result = await pool.query(
      `INSERT INTO header_nav (label, label_km, path, sort_order, is_active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [label, label_km, path, sort_order ?? 0, is_active ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/header-nav/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { label, label_km, path, sort_order, is_active } = req.body;
    if (!label || !label_km || !path) {
      return res.status(400).json({ message: 'label, label_km, and path are required' });
    }
    const result = await pool.query(
      `UPDATE header_nav SET label=$1, label_km=$2, path=$3, sort_order=$4, is_active=$5
       WHERE id=$6 RETURNING *`,
      [label, label_km, path, sort_order ?? 0, is_active ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Nav item not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/header-nav/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM header_nav WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Nav item not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

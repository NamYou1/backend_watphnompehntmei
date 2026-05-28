import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

const router = Router();

/**
 * @swagger
 * /api/contact-info:
 *   get:
 *     summary: Get all contact info entries
 *     tags: [Contact Info]
 *     responses:
 *       200:
 *         description: List of contact info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContactInfo'
 *   post:
 *     summary: Create a contact info entry
 *     tags: [Contact Info]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [info_key]
 *             properties:
 *               info_key: { type: string }
 *               value_en: { type: string }
 *               value_km: { type: string }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactInfo'
 * /api/contact-info/{key}:
 *   get:
 *     summary: Get contact info by key
 *     tags: [Contact Info]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *         example: address
 *     responses:
 *       200:
 *         description: ContactInfo object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactInfo'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update contact info by key
 *     tags: [Contact Info]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value_en: { type: string }
 *               value_km: { type: string }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContactInfo'
 *   delete:
 *     summary: Delete contact info by key
 *     tags: [Contact Info]
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/contact-info
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM contact_info ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/contact-info/:key  (by info_key, e.g. "address")
router.get('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM contact_info WHERE info_key=$1', [req.params.key]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Key not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/contact-info
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { info_key, value_en, value_km } = req.body;
    if (!info_key) return res.status(400).json({ message: 'info_key is required' });

    const result = await pool.query(
      'INSERT INTO contact_info (info_key, value_en, value_km) VALUES ($1,$2,$3) RETURNING *',
      [info_key, value_en ?? null, value_km ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/contact-info/:key
router.put('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { value_en, value_km } = req.body;
    const result = await pool.query(
      `UPDATE contact_info SET value_en=$1, value_km=$2 WHERE info_key=$3 RETURNING *`,
      [value_en ?? null, value_km ?? null, req.params.key]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Key not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/contact-info/:key
router.delete('/:key', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'DELETE FROM contact_info WHERE info_key=$1 RETURNING info_key',
      [req.params.key]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Key not found' });
    res.json({ message: 'Deleted', info_key: result.rows[0].info_key });
  } catch (err) {
    next(err);
  }
});

export default router;

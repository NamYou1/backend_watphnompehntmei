import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/temple-history:
 *   get:
 *     summary: Get all temple history entries
 *     tags: [Temple History]
 *     responses:
 *       200:
 *         description: List of temple history records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TempleHistory'
 *   post:
 *     summary: Create a temple history entry
 *     tags: [Temple History]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [history_year]
 *             properties:
 *               history_year:   { type: integer }
 *               title_en:       { type: string }
 *               title_km:       { type: string }
 *               description_en: { type: string }
 *               description_km: { type: string }
 *               sort_order:     { type: integer }
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempleHistory'
 * /api/temple-history/{id}:
 *   get:
 *     summary: Get temple history entry by ID
 *     tags: [Temple History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: TempleHistory object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempleHistory'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a temple history entry
 *     tags: [Temple History]
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
 *             required: [history_year]
 *             properties:
 *               history_year:   { type: integer }
 *               title_en:       { type: string }
 *               title_km:       { type: string }
 *               description_en: { type: string }
 *               description_km: { type: string }
 *               sort_order:     { type: integer }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TempleHistory'
 *   delete:
 *     summary: Delete a temple history entry
 *     tags: [Temple History]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/temple-history
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id', 'history_year', 'title_en', 'title_km', 'sort_order'], 'sort_order', 'ASC');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE title_en ILIKE $1 OR title_km ILIKE $1 OR description_en ILIKE $1 OR description_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM temple_history ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM temple_history ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/temple-history/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM temple_history WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/temple-history
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { history_year, title_en, title_km, description_en, description_km, sort_order } = req.body;
    if (!history_year) return res.status(400).json({ message: 'history_year is required' });

    const result = await pool.query(
      `INSERT INTO temple_history
         (history_year, title_en, title_km, description_en, description_km, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [history_year, title_en ?? null, title_km ?? null, description_en ?? null, description_km ?? null, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/temple-history/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { history_year, title_en, title_km, description_en, description_km, sort_order } = req.body;
    if (!history_year) return res.status(400).json({ message: 'history_year is required' });

    const result = await pool.query(
      `UPDATE temple_history
       SET history_year=$1, title_en=$2, title_km=$3, description_en=$4, description_km=$5, sort_order=$6
       WHERE id=$7 RETURNING *`,
      [history_year, title_en ?? null, title_km ?? null, description_en ?? null, description_km ?? null, sort_order ?? 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/temple-history/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM temple_history WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

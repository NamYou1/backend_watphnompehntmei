import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/monks/active:
 *   get:
 *     summary: Get all currently active monks (no left_year)
 *     tags: [Monks]
 *     responses:
 *       200:
 *         description: List of active monks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Monk'
 * /api/monks:
 *   get:
 *     summary: Get all monks
 *     tags: [Monks]
 *     responses:
 *       200:
 *         description: List of all monks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Monk'
 *   post:
 *     summary: Create a monk
 *     tags: [Monks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, name_km, title, title_km, join_year]
 *             properties:
 *               name:      { type: string }
 *               name_km:   { type: string }
 *               title:     { type: string }
 *               title_km:  { type: string }
 *               img_url:   { type: string }
 *               join_year: { type: integer }
 *               left_year: { type: integer }
 *               bio:       { type: string }
 *               bio_km:    { type: string }
 *     responses:
 *       201:
 *         description: Created monk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Monk'
 * /api/monks/{id}:
 *   get:
 *     summary: Get monk by ID
 *     tags: [Monks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Monk object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Monk'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a monk
 *     tags: [Monks]
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
 *             required: [name, name_km, title, title_km, join_year]
 *             properties:
 *               name:      { type: string }
 *               name_km:   { type: string }
 *               title:     { type: string }
 *               title_km:  { type: string }
 *               img_url:   { type: string }
 *               join_year: { type: integer }
 *               left_year: { type: integer }
 *               bio:       { type: string }
 *               bio_km:    { type: string }
 *     responses:
 *       200:
 *         description: Updated monk
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Monk'
 *   delete:
 *     summary: Delete a monk
 *     tags: [Monks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

const MONK_SORT_COLS = ['id', 'name', 'name_km', 'title', 'join_year', 'left_year', 'created_at'];

// GET /api/monks/active  — must come before /:id
router.get('/active', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id','name','name_km','title','join_year'], 'join_year', 'ASC');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR name_km ILIKE $1 OR title ILIKE $1 OR title_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM v_active_monks ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM v_active_monks ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/monks
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, MONK_SORT_COLS, 'join_year', 'ASC');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR name_km ILIKE $1 OR title ILIKE $1 OR title_km ILIKE $1 OR bio ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM monks ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM monks ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/monks/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM monks WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Monk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/monks
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, name_km, title, title_km, img_url, join_year, left_year, bio, bio_km } = req.body;
    if (!name || !name_km || !title || !title_km || !join_year) {
      return res.status(400).json({ message: 'name, name_km, title, title_km, join_year are required' });
    }
    const result = await pool.query(
      `INSERT INTO monks (name, name_km, title, title_km, img_url, join_year, left_year, bio, bio_km)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, name_km, title, title_km, img_url ?? null, join_year, left_year ?? null, bio ?? null, bio_km ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/monks/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, name_km, title, title_km, img_url, join_year, left_year, bio, bio_km } = req.body;
    if (!name || !name_km || !title || !title_km || !join_year) {
      return res.status(400).json({ message: 'name, name_km, title, title_km, join_year are required' });
    }
    const result = await pool.query(
      `UPDATE monks
       SET name=$1, name_km=$2, title=$3, title_km=$4, img_url=$5,
           join_year=$6, left_year=$7, bio=$8, bio_km=$9
       WHERE id=$10 RETURNING *`,
      [name, name_km, title, title_km, img_url ?? null, join_year, left_year ?? null, bio ?? null, bio_km ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Monk not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/monks/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM monks WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Monk not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

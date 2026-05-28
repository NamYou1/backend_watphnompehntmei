import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/authors:
 *   get:
 *     summary: Get all authors
 *     tags: [Authors]
 *     responses:
 *       200:
 *         description: List of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Author'
 *   post:
 *     summary: Create an author
 *     tags: [Authors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, name_km]
 *             properties:
 *               name:    { type: string }
 *               name_km: { type: string }
 *               img_url: { type: string }
 *               bio:     { type: string }
 *               bio_km:  { type: string }
 *               email:   { type: string }
 *     responses:
 *       201:
 *         description: Created author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 * /api/authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Author object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update an author
 *     tags: [Authors]
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
 *             required: [name, name_km]
 *             properties:
 *               name:    { type: string }
 *               name_km: { type: string }
 *               img_url: { type: string }
 *               bio:     { type: string }
 *               bio_km:  { type: string }
 *               email:   { type: string }
 *     responses:
 *       200:
 *         description: Updated author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Author'
 *   delete:
 *     summary: Delete an author
 *     tags: [Authors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/authors
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id', 'name', 'name_km', 'email', 'created_at'], 'id', 'ASC');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR name_km ILIKE $1 OR email ILIKE $1 OR bio ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM authors ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM authors ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/authors/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM authors WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Author not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/authors
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, name_km, img_url, bio, bio_km, email } = req.body;
    if (!name || !name_km) {
      return res.status(400).json({ message: 'name and name_km are required' });
    }
    const result = await pool.query(
      `INSERT INTO authors (name, name_km, img_url, bio, bio_km, email)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, name_km, img_url ?? null, bio ?? null, bio_km ?? null, email ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/authors/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, name_km, img_url, bio, bio_km, email } = req.body;
    if (!name || !name_km) {
      return res.status(400).json({ message: 'name and name_km are required' });
    }
    const result = await pool.query(
      `UPDATE authors SET name=$1, name_km=$2, img_url=$3, bio=$4, bio_km=$5, email=$6
       WHERE id=$7 RETURNING *`,
      [name, name_km, img_url ?? null, bio ?? null, bio_km ?? null, email ?? null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Author not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/authors/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM authors WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Author not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

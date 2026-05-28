import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, name_km, slug]
 *             properties:
 *               name:    { type: string }
 *               name_km: { type: string }
 *               slug:    { type: string }
 *     responses:
 *       201:
 *         description: Created category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 * /api/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Category object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a category
 *     tags: [Categories]
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
 *             required: [name, name_km, slug]
 *             properties:
 *               name:    { type: string }
 *               name_km: { type: string }
 *               slug:    { type: string }
 *     responses:
 *       200:
 *         description: Updated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/categories
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id', 'name', 'name_km', 'slug', 'created_at'], 'id', 'ASC');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE name ILIKE $1 OR name_km ILIKE $1 OR slug ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM categories ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM categories ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/categories/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, name_km, slug } = req.body;
    if (!name || !name_km || !slug) {
      return res.status(400).json({ message: 'name, name_km, and slug are required' });
    }
    const result = await pool.query(
      'INSERT INTO categories (name, name_km, slug) VALUES ($1, $2, $3) RETURNING *',
      [name, name_km, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { name, name_km, slug } = req.body;
    if (!name || !name_km || !slug) {
      return res.status(400).json({ message: 'name, name_km, and slug are required' });
    }
    const result = await pool.query(
      'UPDATE categories SET name=$1, name_km=$2, slug=$3 WHERE id=$4 RETURNING *',
      [name, name_km, slug, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM categories WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

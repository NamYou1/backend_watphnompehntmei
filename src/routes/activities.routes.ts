import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/activities/full:
 *   get:
 *     summary: Get all activities with category info (from view)
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of activities with category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 * /api/activities:
 *   get:
 *     summary: Get all activities
 *     tags: [Activities]
 *     responses:
 *       200:
 *         description: List of activities
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Activity'
 *   post:
 *     summary: Create an activity
 *     tags: [Activities]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, title_km, event_year]
 *             properties:
 *               category_id:    { type: integer }
 *               title:          { type: string }
 *               title_km:       { type: string }
 *               description:    { type: string }
 *               description_km: { type: string }
 *               img_url:        { type: string }
 *               video_url:      { type: string }
 *               event_year:     { type: integer }
 *     responses:
 *       201:
 *         description: Created activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 * /api/activities/{id}:
 *   get:
 *     summary: Get activity by ID
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Activity object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update an activity
 *     tags: [Activities]
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
 *             required: [title, title_km, event_year]
 *             properties:
 *               category_id:    { type: integer }
 *               title:          { type: string }
 *               title_km:       { type: string }
 *               description:    { type: string }
 *               description_km: { type: string }
 *               img_url:        { type: string }
 *               video_url:      { type: string }
 *               event_year:     { type: integer }
 *     responses:
 *       200:
 *         description: Updated activity
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Activity'
 *   delete:
 *     summary: Delete an activity
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 * /api/activities/{id}/photos:
 *   get:
 *     summary: Get all photos for an activity
 *     tags: [Activities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: List of activity photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityPhoto'
 */

const ACTIVITY_SORT_COLS = ['id', 'title', 'title_km', 'event_year', 'created_at'];

// GET /api/activities/full — with category (view)  — must come before /:id
router.get('/full', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id','title','title_km','event_year','category'], 'event_year');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE title ILIKE $1 OR title_km ILIKE $1 OR description ILIKE $1 OR description_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM v_activities ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM v_activities ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/activities
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ACTIVITY_SORT_COLS, 'event_year');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE title ILIKE $1 OR title_km ILIKE $1 OR description ILIKE $1 OR description_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM activities ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM activities ${where} ORDER BY ${sort.column} ${sort.direction} LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/activities/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM activities WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Activity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// GET /api/activities/:id/photos
router.get('/:id/photos', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query(
      'SELECT * FROM activity_photos WHERE activity_id=$1 ORDER BY sort_order ASC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/activities
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category_id, title, title_km, description, description_km, img_url, video_url, event_year } = req.body;
    if (!title || !title_km || !event_year) {
      return res.status(400).json({ message: 'title, title_km, and event_year are required' });
    }
    const result = await pool.query(
      `INSERT INTO activities
         (category_id, title, title_km, description, description_km, img_url, video_url, event_year)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [category_id ?? null, title, title_km, description ?? null, description_km ?? null,
       img_url ?? null, video_url ?? null, event_year]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activities/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { category_id, title, title_km, description, description_km, img_url, video_url, event_year } = req.body;
    if (!title || !title_km || !event_year) {
      return res.status(400).json({ message: 'title, title_km, and event_year are required' });
    }
    const result = await pool.query(
      `UPDATE activities
       SET category_id=$1, title=$2, title_km=$3, description=$4, description_km=$5,
           img_url=$6, video_url=$7, event_year=$8
       WHERE id=$9 RETURNING *`,
      [category_id ?? null, title, title_km, description ?? null, description_km ?? null,
       img_url ?? null, video_url ?? null, event_year, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Activity not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activities/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM activities WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Activity not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

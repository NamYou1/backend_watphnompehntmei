import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { parsePagination, parseSort, parseSearch, buildPaginatedResult } from '../utils/queryHelpers';

const router = Router();

/**
 * @swagger
 * /api/articles/full:
 *   get:
 *     summary: Get all articles with category and author info (from view)
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of articles with relations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 * /api/articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     responses:
 *       200:
 *         description: List of articles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Article'
 *   post:
 *     summary: Create an article
 *     tags: [Articles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title_km]
 *             properties:
 *               category_id:    { type: integer }
 *               author_id:      { type: integer }
 *               title:          { type: string }
 *               title_km:       { type: string }
 *               excerpt:        { type: string }
 *               excerpt_km:     { type: string }
 *               content:        { type: string }
 *               content_km:     { type: string }
 *               img_url:        { type: string }
 *               video_url:      { type: string }
 *               published_date: { type: string, format: date }
 *               read_time:      { type: string }
 *               read_time_km:   { type: string }
 *     responses:
 *       201:
 *         description: Created article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 * /api/articles/{id}:
 *   get:
 *     summary: Get article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Article object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
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
 *             required: [title_km]
 *             properties:
 *               category_id:    { type: integer }
 *               author_id:      { type: integer }
 *               title:          { type: string }
 *               title_km:       { type: string }
 *               excerpt:        { type: string }
 *               excerpt_km:     { type: string }
 *               content:        { type: string }
 *               content_km:     { type: string }
 *               img_url:        { type: string }
 *               video_url:      { type: string }
 *               published_date: { type: string, format: date }
 *               read_time:      { type: string }
 *               read_time_km:   { type: string }
 *     responses:
 *       200:
 *         description: Updated article
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Article'
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

const ARTICLE_SORT_COLS = ['id', 'title', 'title_km', 'published_date', 'read_time', 'created_at'];

// GET /api/articles/full — with category + author (view)  — must come before /:id
router.get('/full', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ['id','title','title_km','published_date','category','author'], 'published_date');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE title ILIKE $1 OR title_km ILIKE $1 OR excerpt ILIKE $1 OR excerpt_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM v_articles ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM v_articles ${where} ORDER BY ${sort.column} ${sort.direction} NULLS LAST LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/articles
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pg     = parsePagination(req);
    const sort   = parseSort(req, ARTICLE_SORT_COLS, 'published_date');
    const search = parseSearch(req);

    const params: unknown[] = [];
    let where = '';
    if (search) {
      params.push(`%${search}%`);
      where = `WHERE title ILIKE $1 OR title_km ILIKE $1 OR excerpt ILIKE $1 OR excerpt_km ILIKE $1`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM articles ${where}`, params);
    const total    = parseInt(countRes.rows[0].count, 10);

    params.push(pg.limit, pg.offset);
    const limitIdx  = params.length - 1;
    const offsetIdx = params.length;

    const result = await pool.query(
      `SELECT * FROM articles ${where} ORDER BY ${sort.column} ${sort.direction} NULLS LAST LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );
    res.json(buildPaginatedResult(result.rows, total, pg));
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM articles WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      category_id, author_id, title, title_km, excerpt, excerpt_km,
      content, content_km, img_url, video_url, published_date, read_time, read_time_km,
    } = req.body;
    if (!title_km) return res.status(400).json({ message: 'title_km is required' });

    const result = await pool.query(
      `INSERT INTO articles
         (category_id, author_id, title, title_km, excerpt, excerpt_km,
          content, content_km, img_url, video_url, published_date, read_time, read_time_km)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        category_id ?? null, author_id ?? null, title ?? null, title_km,
        excerpt ?? null, excerpt_km ?? null, content ?? null, content_km ?? null,
        img_url ?? null, video_url ?? null, published_date ?? null,
        read_time ?? null, read_time_km ?? null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/articles/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const {
      category_id, author_id, title, title_km, excerpt, excerpt_km,
      content, content_km, img_url, video_url, published_date, read_time, read_time_km,
    } = req.body;
    if (!title_km) return res.status(400).json({ message: 'title_km is required' });

    const result = await pool.query(
      `UPDATE articles
       SET category_id=$1, author_id=$2, title=$3, title_km=$4, excerpt=$5, excerpt_km=$6,
           content=$7, content_km=$8, img_url=$9, video_url=$10,
           published_date=$11, read_time=$12, read_time_km=$13
       WHERE id=$14 RETURNING *`,
      [
        category_id ?? null, author_id ?? null, title ?? null, title_km,
        excerpt ?? null, excerpt_km ?? null, content ?? null, content_km ?? null,
        img_url ?? null, video_url ?? null, published_date ?? null,
        read_time ?? null, read_time_km ?? null, id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Article not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/articles/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM articles WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Article not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';

const router = Router();

/**
 * @swagger
 * /api/footer:
 *   get:
 *     summary: Get full footer (sections + links joined)
 *     tags: [Footer]
 *     responses:
 *       200:
 *         description: Footer rows from view
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 * /api/footer/sections:
 *   get:
 *     summary: Get all footer sections
 *     tags: [Footer]
 *     responses:
 *       200:
 *         description: List of footer sections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FooterSection'
 *   post:
 *     summary: Create a footer section
 *     tags: [Footer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, title_km]
 *             properties:
 *               title:      { type: string }
 *               title_km:   { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       201:
 *         description: Created footer section
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterSection'
 * /api/footer/sections/{id}:
 *   get:
 *     summary: Get footer section by ID
 *     tags: [Footer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: FooterSection object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterSection'
 *   put:
 *     summary: Update a footer section
 *     tags: [Footer]
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
 *             required: [title, title_km]
 *             properties:
 *               title:      { type: string }
 *               title_km:   { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterSection'
 *   delete:
 *     summary: Delete a footer section
 *     tags: [Footer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 * /api/footer/links:
 *   get:
 *     summary: Get all footer links
 *     tags: [Footer]
 *     responses:
 *       200:
 *         description: List of footer links
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FooterLink'
 *   post:
 *     summary: Create a footer link
 *     tags: [Footer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [section_id, label, label_km, url]
 *             properties:
 *               section_id: { type: integer }
 *               label:      { type: string }
 *               label_km:   { type: string }
 *               url:        { type: string }
 *               icon:       { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       201:
 *         description: Created footer link
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterLink'
 * /api/footer/links/{id}:
 *   get:
 *     summary: Get footer link by ID
 *     tags: [Footer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: FooterLink object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterLink'
 *   put:
 *     summary: Update a footer link
 *     tags: [Footer]
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
 *             required: [section_id, label, label_km, url]
 *             properties:
 *               section_id: { type: integer }
 *               label:      { type: string }
 *               label_km:   { type: string }
 *               url:        { type: string }
 *               icon:       { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FooterLink'
 *   delete:
 *     summary: Delete a footer link
 *     tags: [Footer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/footer — full footer from view
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM v_footer');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// ── Sections ──────────────────────────────────────────────────

// GET /api/footer/sections
router.get('/sections', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query('SELECT * FROM footer_sections ORDER BY sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/footer/sections/:id
router.get('/sections/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM footer_sections WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Section not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/footer/sections
router.post('/sections', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, title_km, sort_order } = req.body;
    if (!title || !title_km) {
      return res.status(400).json({ message: 'title and title_km are required' });
    }
    const result = await pool.query(
      'INSERT INTO footer_sections (title, title_km, sort_order) VALUES ($1,$2,$3) RETURNING *',
      [title, title_km, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/footer/sections/:id
router.put('/sections/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { title, title_km, sort_order } = req.body;
    if (!title || !title_km) {
      return res.status(400).json({ message: 'title and title_km are required' });
    }
    const result = await pool.query(
      'UPDATE footer_sections SET title=$1, title_km=$2, sort_order=$3 WHERE id=$4 RETURNING *',
      [title, title_km, sort_order ?? 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Section not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/footer/sections/:id
router.delete('/sections/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM footer_sections WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Section not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

// ── Links ─────────────────────────────────────────────────────

// GET /api/footer/links
router.get('/links', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await pool.query(
      'SELECT * FROM footer_links ORDER BY section_id ASC, sort_order ASC'
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/footer/links/:id
router.get('/links/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM footer_links WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Link not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/footer/links
router.post('/links', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { section_id, label, label_km, url, icon, sort_order } = req.body;
    if (!section_id || !label || !label_km || !url) {
      return res.status(400).json({ message: 'section_id, label, label_km, and url are required' });
    }
    const result = await pool.query(
      `INSERT INTO footer_links (section_id, label, label_km, url, icon, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [section_id, label, label_km, url, icon ?? null, sort_order ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/footer/links/:id
router.put('/links/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { section_id, label, label_km, url, icon, sort_order } = req.body;
    if (!section_id || !label || !label_km || !url) {
      return res.status(400).json({ message: 'section_id, label, label_km, and url are required' });
    }
    const result = await pool.query(
      `UPDATE footer_links
       SET section_id=$1, label=$2, label_km=$3, url=$4, icon=$5, sort_order=$6
       WHERE id=$7 RETURNING *`,
      [section_id, label, label_km, url, icon ?? null, sort_order ?? 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Link not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/footer/links/:id
router.delete('/links/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM footer_links WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Link not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

import { Router, Request, Response, NextFunction } from 'express';

import pool from '../config/database';
import { upload } from '../middleware/upload';
import { uploadToR2 } from '../utils/r2';
import path from 'path';

const router = Router();

/**
 * @swagger
 * /api/activity-photos:
 *   get:
 *     summary: Get activity photos (optionally filter by activityId)
 *     tags: [Activity Photos]
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema: { type: integer }
 *         description: Filter photos by activity
 *     responses:
 *       200:
 *         description: List of photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ActivityPhoto'
 *   post:
 *     summary: Add a photo to an activity
 *     tags: [Activity Photos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [activity_id, img_url]
 *             properties:
 *               activity_id: { type: integer }
 *               img_url:     { type: string }
 *               sort_order:  { type: integer }
 *     responses:
 *       201:
 *         description: Created photo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityPhoto'
 * /api/activity-photos/{id}:
 *   get:
 *     summary: Get photo by ID
 *     tags: [Activity Photos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Photo object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityPhoto'
 *       404:
 *         description: Not found
 *   put:
 *     summary: Update a photo
 *     tags: [Activity Photos]
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
 *             required: [img_url]
 *             properties:
 *               img_url:    { type: string }
 *               sort_order: { type: integer }
 *     responses:
 *       200:
 *         description: Updated photo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ActivityPhoto'
 *   delete:
 *     summary: Delete a photo
 *     tags: [Activity Photos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted
 */

// GET /api/activity-photos?activityId=X
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const activityId = req.query.activityId ? parseInt(req.query.activityId as string, 10) : null;
    if (activityId !== null && isNaN(activityId)) {
      return res.status(400).json({ message: 'Invalid activityId' });
    }
    const result = activityId
      ? await pool.query(
          'SELECT * FROM activity_photos WHERE activity_id=$1 ORDER BY sort_order ASC',
          [activityId]
        )
      : await pool.query('SELECT * FROM activity_photos ORDER BY activity_id ASC, sort_order ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/activity-photos/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM activity_photos WHERE id=$1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Photo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/activity-photos (upload image/video)
router.post('/', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { activity_id, sort_order } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    if (!activity_id) return res.status(400).json({ error: 'activity_id is required' });

    // Generate unique key for R2
    const ext = path.extname(req.file.originalname);
    const key = `activity_photos/${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
    const url = await uploadToR2(key, req.file.buffer, req.file.mimetype);

    // Insert into DB
    const result = await pool.query(
      'INSERT INTO activity_photos (activity_id, img_url, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [activity_id, url, sort_order || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// PUT /api/activity-photos/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const { img_url, sort_order } = req.body;
    if (!img_url) return res.status(400).json({ message: 'img_url is required' });

    const result = await pool.query(
      'UPDATE activity_photos SET img_url=$1, sort_order=$2 WHERE id=$3 RETURNING *',
      [img_url, sort_order ?? 0, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Photo not found' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/activity-photos/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ message: 'Invalid ID' });

    const result = await pool.query('DELETE FROM activity_photos WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Photo not found' });
    res.json({ message: 'Deleted', id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

export default router;

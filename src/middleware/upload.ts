import multer from 'multer';
import { Request } from 'express';
import path from 'path';

// Accept images and videos only
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only image and video files are allowed'));
};

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
});

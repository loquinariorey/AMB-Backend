// routes/upload.routes.ts
import express from 'express';
import upload from '../middleware/upload_aws';

const router = express.Router();

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ fileUrl: (req.file as any).location });
});

export default router;

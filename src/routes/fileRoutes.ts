import { Router } from 'express';
import * as fileController from '../controllers/fileController';

const router = Router();

// Route to download a specific file by its ID
// GET /api/files/:fileId/download
router.get(
    '/files/:fileId/download',
    fileController.handleDownloadFile
);

export default router; 
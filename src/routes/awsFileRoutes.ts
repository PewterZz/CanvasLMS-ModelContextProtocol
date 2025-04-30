import { Router } from 'express';
// Use the AWS controller
import * as awsFileController from '../controllers/awsFileController';

const router = Router();

// Route to download a specific AWS file by its ID
// GET /files/:fileId/download (prefix /api/aws added in server.ts)
router.get(
    '/files/:fileId/download',
    awsFileController.handleDownloadAwsFile
);

export default router; 
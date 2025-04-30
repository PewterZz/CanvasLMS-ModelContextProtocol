import { Router } from 'express';
import * as pdfController from '../controllers/pdfController';

const router = Router();

/**
 * @swagger
 * /api/pdf/extract-text:
 *   post:
 *     summary: Extract text content from a Canvas PDF file ID
 *     tags: [PDF]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileId
 *             properties:
 *               fileId:
 *                 type: [string, number]
 *                 description: The ID of the PDF file in Canvas.
 *                 example: 44827106
 *     responses:
 *       200:
 *         description: Successfully extracted text content.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 text:
 *                   type: string
 *                   description: The extracted text from the PDF.
 *       400:
 *         description: Bad Request - Missing or invalid fileId.
 *       401:
 *         description: Unauthorized - Invalid API token or insufficient permissions.
 *       404:
 *         description: Not Found - File ID does not exist.
 *       500:
 *         description: Internal Server Error - Failed to fetch, parse PDF, or server configuration error.
 */
router.post('/extract-text', pdfController.extractPdfText);

export default router; 
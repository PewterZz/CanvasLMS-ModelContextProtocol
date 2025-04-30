import { Request, Response, NextFunction } from 'express';
import * as pdfService from '../services/pdfService';

// Define the expected request body structure
interface ExtractPdfTextRequestBody {
    fileId?: number | string; // Can be number or string
}

/**
 * Controller to handle requests for extracting text from a Canvas PDF file ID.
 * Validates input, retrieves credentials, calls the service, and handles responses/errors.
 */
export const extractPdfText = async (req: Request<{}, {}, ExtractPdfTextRequestBody>, res: Response, next: NextFunction): Promise<void> => {
    const { fileId } = req.body;
    const canvasUrl = process.env.CANVAS_API_URL;
    const apiToken = process.env.CANVAS_API_TOKEN;

    // 1. Validate environment variables
    if (!canvasUrl || !apiToken) {
        console.error('Missing CANVAS_API_URL or CANVAS_API_TOKEN in environment variables.');
        // Use next() to pass to the global error handler
        next(new Error('Server configuration error: Missing Canvas credentials.'));
        return;
    }

    // 2. Validate input: Check if fileId exists and is a non-empty string or a number
    if (fileId === undefined || fileId === null || fileId === '') {
        res.status(400).json({ error: 'Missing fileId in request body' });
        return;
    }

    // Optional: Validate fileId format if necessary (e.g., ensure it's numeric if expected)
    const numericFileId = Number(fileId);
    if (isNaN(numericFileId)) {
         // Allow non-numeric if needed, or return error:
        // res.status(400).json({ error: 'Invalid fileId format: must be a number' });
        // return;
        // For now, we proceed assuming fileId can be string or number as per service
        console.warn(`Received non-numeric fileId: ${fileId}. Proceeding...`);
    }

    try {
        console.log(`Controller received request for fileId: ${fileId}`); // Debug log
        // 3. Call the service function with validated data
        const text = await pdfService.getPdfText(fileId, canvasUrl, apiToken);
        // 4. Send successful response
        console.log(`Successfully extracted text for fileId: ${fileId}`); // Debug log
        res.status(200).json({ text });
    } catch (error: unknown) {
        // 5. Handle errors from the service
        console.error(`Controller error for fileId ${fileId}:`, error);
        // The service should throw specific errors, pass them to the global handler
        next(error); // Pass the original error object (or the wrapped one from the service)
    }
}; 
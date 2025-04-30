import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import * as canvasApiService from '../services/canvasApiService';

/**
 * Controller function to download a specific file.
 */
export const handleDownloadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fileId } = req.params;

    if (!fileId) {
        res.status(400).json({ message: 'Missing fileId in request parameters.' });
        return;
    }

    try {
        // 1. Get file metadata from Canvas (includes the actual download URL)
        const fileDetails = await canvasApiService.getFileDetails(fileId);

        // 2. Fetch the file content from the URL provided by Canvas
        //    Important: Use responseType: 'stream' to handle binary data efficiently
        const downloadResponse = await axios({
            method: 'get',
            url: fileDetails.url, // Use the direct download URL from Canvas
            responseType: 'stream',
        });

        // 3. Set headers for browser download
        res.setHeader('Content-Disposition', `attachment; filename="${fileDetails.display_name}"`);
        res.setHeader('Content-Type', fileDetails.content_type);
        if (fileDetails.size) {
            res.setHeader('Content-Length', fileDetails.size.toString());
        }

        // 4. Pipe the downloaded file stream to the client
        downloadResponse.data.pipe(res);

        // Handle errors during the pipe/stream
        downloadResponse.data.on('error', (streamError: Error) => {
            console.error(`Error streaming file ${fileId} (${fileDetails.display_name}):`, streamError);
            // Can't set headers anymore if stream already started
            if (!res.headersSent) {
                 res.status(500).json({ message: 'Error streaming file download.'});
            } else {
                 res.end(); // End the response if headers were already sent
            }
        });

    } catch (error) {
        // Pass errors (e.g., file not found from getFileDetails, network error from axios) 
        // to the global error handler
        next(error); 
    }
}; 
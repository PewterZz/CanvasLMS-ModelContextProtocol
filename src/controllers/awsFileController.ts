import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
// Use the AWS service
import * as awsCanvasApiService from '../services/awsCanvasApiService';

/**
 * Controller function to download a specific file from AWS Canvas.
 */
export const handleDownloadAwsFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { fileId } = req.params;

    if (!fileId) {
        res.status(400).json({ message: 'Missing fileId in request parameters.' });
        return;
    }

    try {
        // Use the AWS service function
        const fileDetails = await awsCanvasApiService.getAwsFileDetails(fileId);

        const downloadResponse = await axios({
            method: 'get',
            url: fileDetails.url,
            responseType: 'stream',
        });

        res.setHeader('Content-Disposition', `attachment; filename="${fileDetails.display_name}"`);
        res.setHeader('Content-Type', fileDetails.content_type);
        if (fileDetails.size) {
            res.setHeader('Content-Length', fileDetails.size.toString());
        }

        downloadResponse.data.pipe(res);

        downloadResponse.data.on('error', (streamError: Error) => {
            console.error(`AWS: Error streaming file ${fileId} (${fileDetails.display_name}):`, streamError);
            if (!res.headersSent) {
                 res.status(500).json({ message: 'AWS: Error streaming file download.'});
            } else {
                 res.end(); 
            }
        });

    } catch (error) {
        next(error); 
    }
}; 
import axios from 'axios';
import pdf from 'pdf-parse';
import fs from 'fs'; // Import Node.js file system module for debugging
import path from 'path'; // Import path module for creating file paths

/**
 * Fetches file metadata from Canvas API to get a direct download URL,
 * then fetches the PDF from that URL and extracts its text content.
 * @param fileId - The ID of the file in Canvas.
 * @param canvasUrl - The base URL of the Canvas instance (e.g., https://rmit.instructure.com).
 * @param apiToken - The Canvas API token for authentication.
 * @returns Promise<string> - The extracted text content.
 * @throws {Error} If fetching metadata, downloading, or parsing fails.
 */
export const getPdfText = async (
    fileId: number | string,
    canvasUrl: string,
    apiToken: string
): Promise<string> => {
    const baseUrl = canvasUrl.endsWith('/') ? canvasUrl.slice(0, -1) : canvasUrl;
    const apiUrl = `${baseUrl}/api/v1/files/${fileId}`;
    let actualDownloadUrl = '';

    try {
        // 1. Get file metadata from Canvas API to find the actual download URL
        console.log(`Fetching file metadata from: ${apiUrl}`);
        const metaResponse = await axios.get(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiToken}`,
            },
            timeout: 15000, // Timeout for metadata request
        });

        if (metaResponse.status !== 200) {
            throw new Error(`Failed to fetch file metadata. Status code: ${metaResponse.status}`);
        }

        if (!metaResponse.data || typeof metaResponse.data.url !== 'string') {
            console.error('Invalid metadata response:', metaResponse.data);
            throw new Error('Could not find download URL (url field) in Canvas file metadata response.');
        }

        actualDownloadUrl = metaResponse.data.url;
        console.log(`Obtained actual download URL: ${actualDownloadUrl}`);

        // 2. Fetch the PDF content from the obtained URL
        console.log(`Attempting to download PDF content from: ${actualDownloadUrl}`);
        const response = await axios.get(actualDownloadUrl, {
            headers: {
                // Include Authorization header just in case it's needed for the direct URL
                Authorization: `Bearer ${apiToken}`,
            },
            responseType: 'arraybuffer',
            timeout: 30000,
            maxRedirects: 5,
        });

        // --- DEBUGGING --- //
        console.log('Download response status:', response.status);
        // console.log('Download response headers:', response.headers); // Keep if needed
        const contentType = response.headers['content-type'];
        console.log(`Downloaded Content-Type: ${contentType}`);

        /*
        try {
            const filePath = path.join(__dirname, 'downloaded_file.pdf');
            fs.writeFileSync(filePath, response.data);
            console.log(`Downloaded data saved to: ${filePath}`);
        } catch (writeError) {
            console.error('Error saving downloaded file:', writeError);
        }
        */
        // --- END DEBUGGING --- //

        if (response.status !== 200) {
            throw new Error(`Failed to fetch PDF content. Status code: ${response.status}`);
        }

        if (!contentType || !contentType.includes('application/pdf')) {
            console.error('Downloaded content is not application/pdf. Aborting parse.');
            let responseText = '';
            try {
                responseText = Buffer.from(response.data).toString('utf-8');
                console.error('Downloaded content (as text):', responseText);
            } catch (bufferError) {
                console.error('Could not convert downloaded buffer to text.');
            }
            throw new Error(`Expected PDF content, but received Content-Type: ${contentType || 'unknown'}. Response excerpt: ${responseText.substring(0, 200)}`);
        }

        console.log('PDF downloaded successfully (Content-Type is PDF), parsing...');

        // 3. Parse the PDF buffer
        const data = await pdf(response.data);

        if (!data || typeof data.text !== 'string') {
            throw new Error('Failed to parse PDF content.');
        }

        console.log('PDF parsed successfully.');
        return data.text;

    } catch (error: unknown) {
        console.error(`Error processing PDF file ID ${fileId} from ${canvasUrl}:`, error);

        if (axios.isAxiosError(error)) {
            let errorMessage = `Network error processing PDF (File ID: ${fileId}): `;
            if (error.request?.path === apiUrl) { // Check if error was during metadata fetch
                 errorMessage = `Network error fetching file metadata (File ID: ${fileId}): `;
            } else if (actualDownloadUrl && error.request?.path === new URL(actualDownloadUrl).pathname) { // Check if error was during content download
                 errorMessage = `Network error downloading PDF content (File ID: ${fileId}): `;
            }

            if (error.response) {
                errorMessage += `Server responded with status ${error.response.status}`;
                if (error.response.data) {
                    try {
                        const responseData = Buffer.isBuffer(error.response.data)
                            ? error.response.data.toString('utf-8')
                            : JSON.stringify(error.response.data);
                        console.error('Error response data:', responseData);
                        // Append response excerpt if it seems helpful (e.g., for auth errors)
                        if (typeof responseData === 'string') {
                             errorMessage += `. Response: ${responseData.substring(0,100)}...`;
                        }
                    } catch (parseError) {
                        console.error('Could not parse error response data.');
                    }
                }
            } else if (error.request) {
                errorMessage += 'No response received from server.';
            } else {
                errorMessage += error.message;
            }
            throw new Error(errorMessage);
        } else if (error instanceof Error) {
            // Distinguish between parsing errors and other errors
            if (error.message.includes('parse PDF')) {
                 throw new Error(`Error parsing PDF (File ID: ${fileId}): ${error.message}`);
            } else {
                throw new Error(`Error processing PDF (File ID: ${fileId}): ${error.message}`);
            }
        } else {
            throw new Error(`An unknown error occurred while processing PDF (File ID: ${fileId}).`);
        }
    }
}; 
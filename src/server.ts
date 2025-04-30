import dotenv from 'dotenv';
// Load environment variables *before* other imports
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import assignmentRoutes from './routes/assignmentRoutes'; // Import standard assignment routes
import courseRoutes from './routes/courseRoutes'; // Import standard course routes
import discussionRoutes from './routes/discussionRoutes'; // Import discussion routes
import fileRoutes from './routes/fileRoutes'; // Import file routes
import pdfRoutes from './routes/pdfRoutes'; // Import PDF routes
import awsAssignmentRoutes from './routes/awsAssignmentRoutes'; // Import AWS assignment routes
import awsCourseRoutes from './routes/awsCourseRoutes'; // Import AWS course routes
import awsFileRoutes from './routes/awsFileRoutes'; // Import AWS file routes

const app: Express = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies

// Basic Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('Canvas MCP Server is running!');
});

// API Routes
app.use('/api', courseRoutes); // Mount course routes under /api
app.use('/api', assignmentRoutes); // Mount assignment routes under /api
app.use('/api', discussionRoutes); // Mount discussion routes under /api
app.use('/api', fileRoutes); // Mount file routes under /api
app.use('/api/pdf', pdfRoutes); // Mount PDF routes under /api/pdf

// AWS Canvas Instance Routes
app.use('/api/aws', awsCourseRoutes); // Mount AWS course routes under /api/aws
app.use('/api/aws', awsAssignmentRoutes); // Mount AWS assignment routes under /api/aws
app.use('/api/aws', awsFileRoutes); // Mount AWS file routes under /api/aws

// TODO: Add other route groups here (e.g., files, courses)

// Global Error Handler (Refined to send JSON)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  // Check if it's a known error type or provide a generic message
  const statusCode = (err as any).status || 500; // Basic status code handling
  const message = err.message || 'Internal Server Error';
  // Ensure error message is always included in the JSON response
  res.status(statusCode).json({ error: { message } });
});

// Start the server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

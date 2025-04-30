import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import toolRoutes from './routes/toolRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tools', toolRoutes);

// Root route for health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CanvasLMS Model Context Protocol API is running',
    docsUrl: '/api/docs' // If you implement API documentation
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
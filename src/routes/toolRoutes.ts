import { Router } from 'express';
import { listTools, getTool, runTool } from '../controllers/toolController';

const router = Router();

// Public endpoints (no authentication required)
router.get('/', listTools);
router.get('/:id', getTool);

// Protected endpoint (requires authentication in request body)
router.post('/:id/execute', runTool);

export default router; 
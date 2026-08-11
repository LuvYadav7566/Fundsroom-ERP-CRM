import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';

const router = Router();

router.use(authenticateToken);

// All roles have personalized access to dashboard operational stats
router.get('/stats', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), DashboardController.getStats);

export default router;

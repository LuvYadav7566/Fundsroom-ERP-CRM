import { Router } from 'express';
import { StockController } from '../controllers/stockController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { addStockSchema } from '../validators/stockValidator';

const router = Router();

router.use(authenticateToken);

// All roles can view stock movement logs
router.get('/movements', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), StockController.getMovements);

// Admin and Warehouse can log stock IN movements
router.post('/in', authorizeRoles('ADMIN', 'WAREHOUSE'), validateRequest(addStockSchema), StockController.addStockIn);

export default router;

import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createProductSchema, updateProductSchema } from '../validators/productValidator';

const router = Router();

router.use(authenticateToken);

// All roles can view products and stock availability
router.get('/', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ProductController.getProducts);
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ProductController.getProductById);

// Admin and Warehouse can add and update products
router.post('/', authorizeRoles('ADMIN', 'WAREHOUSE'), validateRequest(createProductSchema), ProductController.createProduct);
router.put('/:id', authorizeRoles('ADMIN', 'WAREHOUSE'), validateRequest(updateProductSchema), ProductController.updateProduct);

export default router;

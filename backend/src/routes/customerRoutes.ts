import { Router } from 'express';
import { CustomerController } from '../controllers/customerController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerValidator';

const router = Router();

router.use(authenticateToken);

// All roles can view customer lists and details
router.get('/', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), CustomerController.getCustomers);
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), CustomerController.getCustomerById);

// Admin and Sales can create and edit customers
router.post('/', authorizeRoles('ADMIN', 'SALES'), validateRequest(createCustomerSchema), CustomerController.createCustomer);
router.put('/:id', authorizeRoles('ADMIN', 'SALES'), validateRequest(updateCustomerSchema), CustomerController.updateCustomer);

export default router;

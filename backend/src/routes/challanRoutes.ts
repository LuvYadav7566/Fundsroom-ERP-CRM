import { Router } from 'express';
import { ChallanController } from '../controllers/challanController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createChallanSchema, confirmChallanSchema } from '../validators/challanValidator';

const router = Router();

router.use(authenticateToken);

// All roles can view sales challan lists and detail documents
router.get('/', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ChallanController.getChallans);
router.get('/:id', authorizeRoles('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'), ChallanController.getChallanById);

// Admin and Sales can create drafts, confirm challans, and cancel challans
router.post('/', authorizeRoles('ADMIN', 'SALES'), validateRequest(createChallanSchema), ChallanController.createDraftChallan);
router.patch('/:id/confirm', authorizeRoles('ADMIN', 'SALES'), validateRequest(confirmChallanSchema), ChallanController.confirmChallan);
router.patch('/:id/cancel', authorizeRoles('ADMIN', 'SALES'), validateRequest(confirmChallanSchema), ChallanController.cancelChallan);

export default router;

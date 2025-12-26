import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', authorizeRoles(['ADMIN']), UserController.create);
router.get('/', authorizeRoles(['ADMIN']), UserController.getAll);
router.put('/:studentId/assign-class', authorizeRoles(['ADMIN']), UserController.assignClass);

export default router;

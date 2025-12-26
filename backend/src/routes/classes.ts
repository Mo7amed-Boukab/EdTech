import { Router } from 'express';
import { ClassController } from '../controllers/classController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes accessibles uniquement aux ADMIN
router.post('/', authorizeRoles(['ADMIN']), ClassController.create);
router.put('/:id', authorizeRoles(['ADMIN']), ClassController.update);
router.put('/:id/assign-teacher', authorizeRoles(['ADMIN']), ClassController.assignTeacher);
router.delete('/:id', authorizeRoles(['ADMIN']), ClassController.delete);

// Routes accessibles à tous les utilisateurs authentifiés (ou restreindre selon besoin)
router.get('/', ClassController.getAll);
router.get('/:id', ClassController.getOne);

export default router;

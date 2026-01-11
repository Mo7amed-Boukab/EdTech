import { Router } from 'express';
import { SubjectController } from '../controllers/subjectController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', authorizeRoles(['ADMIN', 'TEACHER']), SubjectController.create);
router.get('/', SubjectController.getAll);
router.get('/:id', SubjectController.getOne);
router.put('/:id', authorizeRoles(['ADMIN', 'TEACHER']), SubjectController.update);
router.delete('/:id', authorizeRoles(['ADMIN', 'TEACHER']), SubjectController.delete);

export default router;

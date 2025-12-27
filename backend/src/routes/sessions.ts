import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', authorizeRoles(['TEACHER']), SessionController.create);
router.get('/', SessionController.getAll);
router.put('/:id', authorizeRoles(['TEACHER']), SessionController.update);
router.delete('/:id', authorizeRoles(['TEACHER']), SessionController.delete);

router.post('/:id/attendance', authorizeRoles(['ADMIN', 'TEACHER']), SessionController.markAttendance);
router.get('/:id/attendance', authorizeRoles(['ADMIN', 'TEACHER']), SessionController.getAttendance);

export default router;

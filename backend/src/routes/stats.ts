import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/global', authorizeRoles(['ADMIN']), StatsController.getGlobal);
router.get('/class/:classId', authorizeRoles(['ADMIN', 'TEACHER']), StatsController.getClassStats);
router.get('/student/:studentId', StatsController.getStudentStats);

export default router;

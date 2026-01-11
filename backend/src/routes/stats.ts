import { Router } from 'express';
import { StatsController } from '../controllers/statsController';
import { authenticateToken, authorizeRoles } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/global', authorizeRoles(['ADMIN']), StatsController.getGlobal);
router.get('/teacher', authorizeRoles(['TEACHER']), StatsController.getTeacherStats);
router.get('/class/:classId', authorizeRoles(['ADMIN', 'TEACHER']), StatsController.getClassStats);
router.get('/student-dashboard', authorizeRoles(['STUDENT']), StatsController.getStudentDashboard);
router.get('/student/:studentId', StatsController.getStudentStats);

export default router;

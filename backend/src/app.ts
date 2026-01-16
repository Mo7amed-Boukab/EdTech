import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth';
import classRouter from './routes/classes';
import userRouter from './routes/users';
import subjectRouter from './routes/subjects';
import sessionRouter from './routes/sessions';
import statsRouter from './routes/stats';
import attendanceRouter from './routes/attendance';
import { errorHandler } from './middlewares/errorHandlerMiddleware';
import { notFound } from './middlewares/notFoundMiddleware';
import logger from './utils/logger';
import prisma from './config/prismaClient';

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// DB connection
(async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error('Database connection failed', err);
    process.exit(1);
  }
})();

app.get('/', (req, res) => {
  res.json({ message: 'EdAcademy API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/classes', classRouter);
app.use('/api/users', userRouter);
app.use('/api/subjects', subjectRouter);
app.use('/api/sessions', sessionRouter);
app.use('/api/stats', statsRouter);
app.use('/api/attendance', attendanceRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

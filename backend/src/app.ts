import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRouter from './routes/auth';
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

app.use('/auth', authRouter);

app.use(notFound);
app.use(errorHandler);

export default app;

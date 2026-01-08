import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import { sql } from 'drizzle-orm'; 
import authRouter from './routes/auth.routes.js';
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import morgan from 'morgan';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

app.get('/health', (req, res) => {
  res.send('Welcome to the Task Management System API');
});


const testConnection = async () => {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    console.log('Database Connection Successful!');
    console.log('DB Time:', result[0].now);
  } catch (err) {
    console.error('Database Connection Failed:', err.message);
  }
};

app.listen(PORT, () => {
  testConnection();
  console.log(`Server is running on http://localhost:${PORT}`);
});
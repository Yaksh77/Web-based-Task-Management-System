import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/db.js';
import { sql } from 'drizzle-orm'; 
import authRouter from './routes/auth.routes.js';
import { verifyToken } from './middleware/auth.middleware.js';
import userRouter from './routes/user.routes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRouter);
app.use('/api/user',verifyToken, userRouter);

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
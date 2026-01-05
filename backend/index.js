import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testDbConnection } from './config/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.send('Welcome to the Task Management System API');
});

app.listen(PORT, () => {
  testDbConnection();
  console.log(`Server is running on http://localhost:${PORT}`);
});
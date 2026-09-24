import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import studentRoutes from './routes/studentRoutes.js';
import Student from './models/Student.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const mongoUri = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Student Records API is running'
  });
});

app.use('/students', studentRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({
    message: 'Unexpected server error',
    error: error.message
  });
});

const startServer = async () => {
  if (!mongoUri) {
    console.error('MONGO_URI is not configured');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    await Student.init();
    console.log('MongoDB connected');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();

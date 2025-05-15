import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import uploadRoutes from './routes/uploadRoutes.js';
import clothesRoutes from './routes/clothesRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // for parsing application/json
app.use(cors());         // enable CORS for frontend-backend communication

app.use('/api/upload', uploadRoutes);
app.use('/api/clothes', clothesRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Example base route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Later: import and use your routes (e.g. clothes, users, uploads)
    // app.use('/api/clothes', clothesRoutes);
    // app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
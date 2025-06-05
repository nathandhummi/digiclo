import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GridFSBucket } from 'mongodb';

import uploadRoutes from './routes/uploadRoutes.js';
import clothesRoutes from './routes/clothesRoutes.js';
import outfitRoutes from './routes/outfitRoutes.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json({ limit: '20mb' })); // for parsing application/json
app.use(cors());         // enable CORS for frontend-backend communication

// Initialize GridFS bucket
let gridFSBucket;

// Serve static files from the uploads directory
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB');
  // Initialize GridFS bucket after MongoDB connection
  gridFSBucket = new GridFSBucket(mongoose.connection.db, {
    bucketName: 'profilePhotos'
  });
  console.log('✅ GridFS bucket initialized');
}).catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Make GridFS bucket available to routes
app.use((req, res, next) => {
  req.gridFSBucket = gridFSBucket;
  next();
});

app.use('/api/upload', uploadRoutes);
app.use('/api/clothes', clothesRoutes);
app.use('/api/outfits', outfitRoutes);
app.use('/api/auth', authRoutes);

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
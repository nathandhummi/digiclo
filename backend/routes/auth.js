import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Helper: Upload file to GridFS
const uploadToGridFS = async (file, bucket) => {
  try {
    console.log('Starting GridFS upload...');
    const filename = `${Date.now()}-${file.originalname}`;

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        uploadedBy: 'user',
        uploadDate: new Date()
      }
    });

    return new Promise((resolve, reject) => {
      uploadStream.on('error', (error) => {
        console.error('Error uploading file to GridFS:', error);
        reject(error);
      });

      uploadStream.on('finish', () => {
        console.log('File uploaded successfully with ID:', uploadStream.id);
        resolve(uploadStream.id);
      });

      uploadStream.write(file.buffer);
      uploadStream.end();
    });
  } catch (error) {
    console.error('Error in uploadToGridFS:', error);
    throw error;
  }
};

const getFileUrl = (fileId) => `/api/auth/photo/${fileId}`;

// Signup
router.post('/signup', upload.single('photo'), async (req, res) => {
  try {
    console.log('Signup request received:', { body: req.body, file: !!req.file });
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
      return res.status(400).json({ message: 'Email, password and username are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let photoUrl;
    if (req.file) {
      const fileId = await uploadToGridFS(req.file, req.gridFSBucket);
      photoUrl = getFileUrl(fileId);
    }

    const user = new User({ email, password, username, photoUrl });

    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Update photo
router.put('/update-photo', upload.single('photo'), async (req, res) => {
  try {
    console.log('Update photo request received');

    if (!req.file) {
      return res.status(400).json({ message: 'No photo uploaded' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const fileId = await uploadToGridFS(req.file, req.gridFSBucket);
    user.photoUrl = getFileUrl(fileId);
    await user.save();

    res.json({ message: 'Profile photo updated successfully', photoUrl: user.photoUrl });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Error updating profile photo', error: error.message });
  }
});

// Serve profile photo
router.get('/photo/:fileId', async (req, res) => {
  try {
    console.log('Photo request received for fileId:', req.params.fileId);
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);
    
    // Check if file exists
    const files = await req.gridFSBucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      console.log('File not found in GridFS');
      return res.status(404).json({ message: 'File not found' });
    }
    
    console.log('File found in GridFS:', files[0]);
    
    const downloadStream = req.gridFSBucket.openDownloadStream(fileId);
    
    // Set appropriate headers
    res.set({
      'Content-Type': files[0].contentType,
      'Content-Length': files[0].length,
      'Cache-Control': 'public, max-age=31536000'
    });

    downloadStream.on('error', (err) => {
      console.error('Stream error:', err);
      res.status(404).json({ message: 'File not found' });
    });

    downloadStream.on('end', () => {
      console.log('File stream ended successfully');
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving photo:', error);
    res.status(500).json({ message: 'Error retrieving photo', error: error.message });
  }
});

export default router;

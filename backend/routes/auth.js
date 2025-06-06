import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import User from '../models/User.js';
import cloudinary from '../cloudinary/config.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';

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

// Helper: Upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    console.log('Starting Cloudinary upload...');
    
    // Convert buffer to base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'profile_photos',
      width: 300,
      height: 300,
      crop: 'fill'
    });
    
    console.log('File uploaded successfully to Cloudinary:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Error in uploadToCloudinary:', error);
    throw error;
  }
};

// Signup
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', {
      body: req.body
    });

    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      username,
      photoUrl: '' // Default empty photo URL
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({
      message: 'User created successfully',
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
    res.status(500).json({ message: 'Error creating user' });
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

    // If user has an existing photo, delete it from Cloudinary
    if (user.photoUrl) {
      try {
        const publicId = user.photoUrl.split('/').slice(-1)[0].split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    const photoUrl = await uploadToCloudinary(req.file);
    user.photoUrl = photoUrl;
    await user.save();

    res.json({ message: 'Profile photo updated successfully', photoUrl: user.photoUrl });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Error updating profile photo', error: error.message });
  }
});

// Update username
router.put('/update-username', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    user.username = username;
    await user.save();

    res.json({ message: 'Username updated successfully', username: user.username });
  } catch (error) {
    console.error('Error updating username:', error);
    res.status(500).json({ message: 'Error updating username', error: error.message });
  }
});

// Update bio
router.put('/update-bio', async (req, res) => {
  try {
    const { bio } = req.body;
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: 'Bio cannot exceed 500 characters' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.bio = bio || '';
    await user.save();

    res.json({ message: 'Bio updated successfully', bio: user.bio });
  } catch (error) {
    console.error('Error updating bio:', error);
    res.status(500).json({ message: 'Error updating bio', error: error.message });
  }
});

export default router;

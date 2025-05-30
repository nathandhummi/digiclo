import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup request received:', { body: req.body });
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    console.log('Creating new user:', email);
    // Create new user
    const user = new User({
      email,
      password
    });

    try {
      await user.save();
      console.log('User saved successfully');
    } catch (saveError) {
      console.error('Error saving user:', saveError);
      return res.status(500).json({ 
        message: 'Error saving user', 
        error: saveError.message,
        details: saveError.errors // Mongoose validation errors if any
      });
    }

    // Generate JWT token
    try {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
      }
      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      console.log('JWT token generated successfully');

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email
        }
      });
    } catch (tokenError) {
      console.error('Error generating token:', tokenError);
      return res.status(500).json({ 
        message: 'Error generating authentication token', 
        error: tokenError.message 
      });
    }
  } catch (error) {
    console.error('Unexpected error in signup:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

export default router; 
import express from 'express';
import ClothingItem from '../models/ClothingItem.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

router.post('/', authenticateUser, async (req, res) => {
  try {
    const { label, category, imageUrl } = req.body;


    if (!label || !category || !imageUrl) {
      return res.status(400).json({ error: 'Label, category, and imageUrl are required' });
    }

    const newItem = new ClothingItem({ label, category, imageUrl, userId: req.user._id });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Failed to save clothing item:', err);
    res.status(500).json({ error: 'Could not save item' });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    const items = await ClothingItem.find({ userId: req.user._id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

export default router;

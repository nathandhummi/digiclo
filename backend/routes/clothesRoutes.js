import express from 'express';
import ClothingItem from '../models/ClothingItem.js';
import authenticateUser from '../middleware/authenticateUser.js';

const router = express.Router();

// Create a new item (with optional tags/isFavorite)
router.post('/', authenticateUser, async (req, res) => {
  try {
    const {
      label,
      category,
      imageUrl,
      tags = [],
      isFavorite = false,
    } = req.body;

    if (!label || !category || !imageUrl) {
      return res
        .status(400)
        .json({ error: 'Label, category, and imageUrl are required' });
    }

    const newItem = new ClothingItem({
      label,
      category,
      imageUrl,
      tags,
      isFavorite,
      userId: req.user._id,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error('Failed to save clothing item:', err);
    res.status(500).json({ error: 'Could not save item' });
  }
});

// Fetch all items for this user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const items = await ClothingItem
      .find({ userId: req.user._id })
      .sort('-createdAt');
    res.json(items);
  } catch (err) {
    console.error('Failed to fetch clothing items:', err);
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Toggle favorite flag (only for this user’s items)
router.patch('/:id/favorite', authenticateUser, async (req, res) => {
  try {
    const item = await ClothingItem.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    item.isFavorite = !item.isFavorite;
    await item.save();
    res.json(item);
  } catch (err) {
    console.error('Failed to toggle favorite:', err);
    res.status(500).json({ error: 'Could not update favorite status' });
  }
});

export default router;

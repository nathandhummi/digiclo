import express from 'express';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

// Create a new item (with optional tags/isFavorite)
router.post('/', async (req, res) => {
  try {
    const { label, category, imageUrl, tags = [], isFavorite = false } = req.body;

    if (!label || !category || !imageUrl) {
      return res.status(400).json({ error: 'Label, category, and imageUrl are required' });
    }

    const newItem = new ClothingItem({ label, category, imageUrl, tags, isFavorite });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Failed to save clothing item:', err);
    res.status(500).json({ error: 'Could not save item' });
  }
});

// Fetch all items
router.get('/', async (req, res) => {
  try {
    const items = await ClothingItem.find().sort('-createdAt');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

// Toggle favorite flag
router.patch('/:id/favorite', async (req, res) => {
  try {
    const item = await ClothingItem.findById(req.params.id);
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

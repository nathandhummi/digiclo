import express from 'express';
import ClothingItem from '../models/ClothingItem.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, type, color, imageUrl } = req.body;
    const item = new ClothingItem({ name, type, color, imageUrl });
    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Failed to save clothing item:', err);
    res.status(500).json({ error: 'Could not save item' });
  }
});

router.get('/', async (req, res) => {
  try {
    const items = await ClothingItem.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch items' });
  }
});

export default router;

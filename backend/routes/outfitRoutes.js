// routes/outfits.ts or outfits.routes.ts
import express from 'express';
import Outfit from '../models/Outfit.js';
import axios from 'axios';

const router = express.Router();

// GET /outfits - get all outfits
router.get('/', async (req, res) => {
  try {
    const outfits = await Outfit.find()
      .populate('top')
      .populate('bottom')
      .populate('shoe')
      .sort({ createdAt: -1 }); // Optional: newest first

    res.json(outfits);
  } catch (err) {
    console.error('Failed to get outfits:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  const { top, bottom, shoe, prompt, imageUrl } = req.body;

  if (!top || !bottom || !shoe || !prompt || !imageUrl) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newOutfit = new Outfit({ top, bottom, shoe, prompt, imageUrl });
    await newOutfit.save();

    const populatedOutfit = await Outfit.findById(newOutfit._id)
        .populate('top')
        .populate('bottom')
        .populate('shoe');

    res.status(201).json(populatedOutfit);
  } catch (err) {
    console.error('Failed to save outfit:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/generate-image', async (req, res) => {
  const { prompt, images } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Missing prompt' });
  }

  try {
    // Optionally: log images or include them in the prompt for visual context
    console.log('Generating image with prompt:', prompt);
    console.log('Clothing images:', images);

    // Call OpenAI's image generation endpoint
    const openaiRes = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'url',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageUrl = openaiRes.data.data[0].url;
    res.json({ imageUrl });

  } catch (err) {
    console.error('Image generation failed:', err);
    res.status(500).json({ message: 'Failed to generate image' });
  }
});

export default router;

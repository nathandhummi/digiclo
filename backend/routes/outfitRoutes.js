// routes/outfits.ts or outfits.routes.ts
import express from 'express';
import Outfit from '../models/Outfit.js';
import axios from 'axios';
import Replicate from 'replicate';
import openai from '../utils/openaiClient.js'; // don't forget the .js at the end

const router = express.Router();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN, // Put this in your .env file
});

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

// POST /api/outfits/generate-image
router.post('/generate-image', async (req, res) => {
  console.log('REQ BODY:', req.body); // <- add this
  const { prompt, images } = req.body;

  if (!images || images.length < 3) {
    return res.status(400).json({ message: 'Missing prompt or image references' });
  }

  try {
    console.log('Describing clothing items with GPT-4-Vision...');

    const getDescription = async (imageUrl) => {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Describe this clothing item in one short sentence. Mention the color, style, and material." },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 100
      });

      return completion.choices[0].message.content;
    };

    const [topDesc, bottomDesc, shoeDesc] = await Promise.all(images.map(getDescription));

    const fullPrompt = `Show a mannequin wearing the following:
    - Top: ${topDesc}
    - Bottom: ${bottomDesc}
    - Shoes: ${shoeDesc}
    Use a white background and fashion model lighting. Focus on style, fabric, color, and realistic proportions. Do not show faces or hands.`;

    console.log('Final Prompt:', fullPrompt);

    const imageGen = await openai.images.generate({
      model: "dall-e-3",
      prompt: fullPrompt,
      size: "1024x1024",
      n: 1,
      response_format: "url"
    });

    const imageUrl = imageGen.data[0].url;

    res.json({ imageUrl, prompt: fullPrompt });
  } catch (err) {
    console.error('Image generation failed:', err?.response?.data || err);
    res.status(500).json({ message: 'Failed to generate image' });
  }
});

export default router;

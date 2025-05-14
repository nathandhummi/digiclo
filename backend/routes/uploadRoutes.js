import express from 'express';
import cloudinary from '../cloudinary/config.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { image } = req.body; // base64 or URL from frontend

    const result = await cloudinary.uploader.upload(image, {
      folder: 'digiclo-clothes',
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;

import express from 'express';
import cloudinary from '../cloudinary/config.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { image } = req.body; // base64 string

    const inputPath = path.resolve(`./temp/${uuidv4()}.png`);
    const outputPath = inputPath.replace('.png', '-no-bg.png');

    // Save base64 image to file
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    fs.writeFileSync(inputPath, Buffer.from(base64Data, 'base64'));

    // Run rembg CLI
    exec(`rembg i ${inputPath} ${outputPath}`, async (error) => {
      if (error) {
        console.error('rembg failed:', error);
        return res.status(500).json({ error: 'Background removal failed' });
      }

      // Upload no-background image to Cloudinary
      const result = await cloudinary.uploader.upload(outputPath, {
        folder: 'digiclo-clothes',
      });

      // Clean up temp files
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);

      res.json({ url: result.secure_url });
    });
  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;

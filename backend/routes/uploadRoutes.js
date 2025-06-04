// src/routes/uploadRoutes.js
import express from 'express';
import cloudinary from '../cloudinary/config.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const exec = promisify(execCb);
const router = express.Router();

router.post('/', async (req, res) => {
  console.log('POST /api/upload');
  const { image } = req.body;

  // 1) Build unique temp filenames
  const inputPath = path.resolve(`./temp/${uuidv4()}.png`);
  const outputPath = inputPath.replace('.png', '-no-bg.png');

  try {
    // 2) Save the base64 image to disk
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    fs.mkdirSync(path.dirname(inputPath), { recursive: true });
    fs.writeFileSync(inputPath, Buffer.from(base64Data, 'base64'));
    console.log('Saved image to:', inputPath);

    // 3) Call our Python helper to remove the background
    //    Make sure `remove_bg.py` is in the same folder and that `python3` is on PATH
    console.log('Running Python remove_bg:', `python3 remove_bg.py ${inputPath} ${outputPath}`);
    await exec(`python3 remove_bg.py ${inputPath} ${outputPath}`);
    console.log('Background removed:', outputPath);

    // 4) Compress & resize with sharp
    const compressedPath = outputPath.replace('.png', '-compressed.png');
    await sharp(outputPath)
      .resize({ width: 1000 }) // scale down proportionally
      .png({ compressionLevel: 9 })
      .toFile(compressedPath);

    // 5) Upload compressed image to Cloudinary
    const result = await cloudinary.uploader.upload(compressedPath, {
      folder: 'digiclo-clothes',
    });

    // 6) Clean up temp files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    fs.unlinkSync(compressedPath);

    // 7) Send back the Cloudinary URL
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload failed:', err);

    // Clean up any files that exist
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;

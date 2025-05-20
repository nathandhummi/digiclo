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

  const inputPath = path.resolve(`./temp/${uuidv4()}.png`);
  const outputPath = inputPath.replace('.png', '-no-bg.png');

  try {
    // Save base64 image to file
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    fs.mkdirSync(path.dirname(inputPath), { recursive: true });
    fs.writeFileSync(inputPath, Buffer.from(base64Data, 'base64'));
    console.log('Saved image to:', inputPath);

    // Run rembg via exec (promisified)
    console.log('Running rembg:', `rembg i ${inputPath} ${outputPath}`);
    await exec(`rembg i ${inputPath} ${outputPath}`);

    const compressedPath = outputPath.replace('.png', '-compressed.png');

    await sharp(outputPath)
      .resize({ width: 1000 })  // scale image down proportionally
      .png({ compressionLevel: 9 })
      .toFile(compressedPath);

    // then upload `compressedPath`:
    const result = await cloudinary.uploader.upload(compressedPath, {
      folder: 'digiclo-clothes',
    });


    // Clean up
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);
    fs.unlinkSync(compressedPath);

    // Send URL
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload failed:', err);

    // Clean up if something fails
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    res.status(500).json({ error: 'Image upload failed' });
  }
});

export default router;

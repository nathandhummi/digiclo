import mongoose from 'mongoose';

const clothingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String }, // e.g., "shirt", "pants"
  color: { type: String },
  imageUrl: { type: String, required: true },
});

export default mongoose.model('ClothingItem', clothingItemSchema);
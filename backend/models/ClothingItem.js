import mongoose from 'mongoose';

const clothingItemSchema = new mongoose.Schema({

  label:       { type: String,   required: true },
  category:    { type: String,   required: true },
  imageUrl:    { type: String,   required: true },
  tags:        [{ type: String }],
  isFavorite:  { type: Boolean,  default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }

}, { timestamps: true });

export default mongoose.model('ClothingItem', clothingItemSchema);
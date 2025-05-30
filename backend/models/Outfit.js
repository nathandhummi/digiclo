import mongoose from 'mongoose';

const outfitSchema = new mongoose.Schema({
  top: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true,
  },
  bottom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true,
  },
  shoe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClothingItem',
    required: true,
  },
}, { timestamps: true });

const Outfit = mongoose.model('Outfit', outfitSchema);
export default Outfit;
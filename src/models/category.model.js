import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    name: { type: String, required: [true, 'Please provide a category name'], trim: true },
    image: { type: String, default: '' },
}, { timestamps: true });

CategorySchema.index({ merchant: 1, name: 1 }, { unique: true });
const Category = mongoose.model('Category', CategorySchema);
export default Category;

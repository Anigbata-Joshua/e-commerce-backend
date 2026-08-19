import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: [true, 'Please provide review text'], trim: true },
}, { timestamps: true });

ReviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', ReviewSchema);
export default Review;

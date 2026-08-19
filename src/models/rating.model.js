import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '' },
    value: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

// One rating per user per product — re-posting upserts rather than duplicating
RatingSchema.index({ product: 1, user: 1 }, { unique: true });

const Rating = mongoose.model('Rating', RatingSchema);
export default Rating;

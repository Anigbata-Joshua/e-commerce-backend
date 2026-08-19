import mongoose from 'mongoose';

const LikeSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

LikeSchema.index({ product: 1, user: 1 }, { unique: true });

const Like = mongoose.model('Like', LikeSchema);
export default Like;

import mongoose from 'mongoose';

const CartVariationSchema = new mongoose.Schema({
    color_index: { type: Number, default: null },
    size_index: { type: Number, default: null },
}, { _id: false });

const CartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    has_variation: { type: Boolean, default: false },
    variation: { type: CartVariationSchema, default: undefined },
}, { _id: false });

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    note: { type: String, default: '' },
}, { timestamps: true });

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;

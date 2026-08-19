import mongoose from 'mongoose';


const OrderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    title: { type: String, required: true },
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    has_variation: { type: Boolean, default: false },
    variation: { type: mongoose.Schema.Types.Mixed, default: undefined },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    note: { type: String, default: '' },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'],
        default: 'pending',
    },
}, { timestamps: true });

OrderSchema.index({ 'items.merchant': 1 });
OrderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model('Order', OrderSchema);
export default Order;

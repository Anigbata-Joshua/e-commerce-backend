import mongoose from 'mongoose';

// attrib: freeform spec groups, e.g. { type: "Other", content: [{ name, value }] }
const AttribSchema = new mongoose.Schema({
    type: { type: String, required: true },
    content: [{
        name: { type: String, required: true },
        value: { type: String, required: true },
    }],
}, { _id: false });

// variations: color/size-style options, each rendered as an image and/or text
const VariationDisplaySchema = new mongoose.Schema({
    type: { type: String, enum: ['image', 'text'], required: true },
    value: { type: String, required: true },
}, { _id: false });

const VariationOptionSchema = new mongoose.Schema({
    display: [VariationDisplaySchema],
    text: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const VariationSchema = new mongoose.Schema({
    type: { type: String, required: true }, // e.g. "color", "size"
    text: { type: String, required: true }, // display label, e.g. "EUR Size"
    content: [VariationOptionSchema],
}, { _id: false });

const ProductSchema = new mongoose.Schema({
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    title: { type: String, required: [true, 'Please provide a title'], trim: true },
    descp: { type: String, default: '' },
    price: { type: Number, required: [true, 'Please provide a price'], min: 0 },
    brand: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    currency: { type: String, default: 'NGN' },
    min_qty: { type: Number, default: 1 },
    max_qty: { type: Number, default: 1 },
    discount: { type: Number, default: 0 },
    discount_expiration: { type: Date, default: null },
    has_refund_policy: { type: Boolean, default: false },
    has_discount: { type: Boolean, default: false },
    has_shipment: { type: Boolean, default: true },
    has_variation: { type: Boolean, default: false },
    shipping_locations: [{ type: String }],
    attrib: [AttribSchema],
    variations: [VariationSchema],
}, { timestamps: true });

ProductSchema.index({ merchant: 1, category: 1 });
ProductSchema.index({ title: 'text', descp: 'text' });

const Product = mongoose.model('Product', ProductSchema);
export default Product;

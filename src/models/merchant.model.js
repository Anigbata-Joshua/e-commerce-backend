import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const MerchantSchema = new mongoose.Schema({
    full_name: { type: String, required: [true, 'Please provide a full name'], trim: true },
    email: { type: String, required: [true, 'Please provide an email'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'], },
    phone: { type: String, required: [true, 'Please provide a phone number'] },
    phones: [{ type: String }],
    password: {
        type: String, required: [true, 'Please provide a password'], minlength: [6, 'Password must be at least 6 characters long'], select: false, validate: {
            validator: function (v) { return /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v); },
            message: 'Password must contain at least one uppercase letter, and number',
        },
    },
    store_name: { type: String, required: [true, 'Please provide a store name'], trim: true },
    descp: { type: String, default: '' },
    icon: { type: String, default: '' },
    banner: { type: String, default: '' },
    state: { type: String, default: '' },
    district: { type: String, default: '' },
    social_media: {
        x: { type: String, default: '' },
        face_book: { type: String, default: '' },
        instagram: { type: String, default: '' },
    },
    refreshToken: { type: String, default: null, select: false },

}, { timestamps: true });

MerchantSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

MerchantSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

MerchantSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

const Merchant = mongoose.model('Merchant', MerchantSchema);
export default Merchant;

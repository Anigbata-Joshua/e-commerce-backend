import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
    full_name: { type: String, required: [true, 'Please provide a full name'], trim: true },
    email: {type: String,required: [true, 'Please provide an email'],unique: true ,lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],},
    phone: { type: String, required: [true, 'Please provide a phone number'] },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,
        validate: {
            validator: function (v) {
                return /[A-Z]/.test(v) && /[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v);
            },
            message: 'Password must contain at least one uppercase letter, one number, and one special character',
        },
    },
    refreshToken: { type: String, default: null, select: false },

}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};

const User = mongoose.model('User', UserSchema);
export default User;

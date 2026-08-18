import Merchant from "../models/merchant.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";



// @route   GET /api/merchants/:id — public storefront profile
export const getMerchant = asyncHandler(async (req, res) => {
    const merchant = await Merchant.findById(req.params.id);
    if (!merchant) {
        throw new ApiError(404, 'Merchant not found');
    }
    res.status(200).json({ success: true, merchant });
});

// @route   PATCH /api/merchants/me — authenticated merchant only
export const updateMerchant = asyncHandler(async (req, res) => {
    const merchant = await Merchant.findByIdAndUpdate(req.merchant._id, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({ success: true, merchant });
});

// @route   PATCH /api/merchants/me/change-password
export const changeMerchantPassword = asyncHandler(async (req, res) => {
    const { old_password, new_password } = req.body;

    const merchant = await Merchant.findById(req.merchant._id).select('+password');

    const isMatch = await merchant.comparePassword(old_password);
    if (!isMatch) {
        throw new ApiError(401, 'Old password is incorrect');
    }

    merchant.password = new_password;
    await merchant.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
});

import { z } from 'zod';
import ApiError from '../utils/ApiError.js';

// Reusable middleware to validate request body using a Zod schema
export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof z.ZodError) {
            const errorMessages = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
            return next(new ApiError(400, errorMessages));
        }
        next(err);
    }
};

const objectIdSchema = z.string().refine((val) => /^[0-9a-fA-F]{24}$/.test(val), {
    message: 'Invalid ID format',
});

const passwordComplexity = z.string()
    .min(6, 'Password must be at least 6 characters long')
    .refine((val) => /[A-Z]/.test(val), 'Password must contain at least one uppercase letter')
    .refine((val) => /[0-9]/.test(val), 'Password must contain at least one number')
    .refine((val) => /[^A-Za-z0-9]/.test(val), 'Password must contain at least one special character');


// ---------- Merchant ----------
export const merchantRegisterSchema = z.object({
    full_name: z.string().min(1, 'full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone is required'),
    phones: z.array(z.string()).optional(),
    password: passwordComplexity,
    store_name: z.string().min(1, 'Store name is required'),
    descp: z.string().optional(),
    icon: z.string().url('Invalid icon URL').optional().or(z.literal('')),
    banner: z.string().url('Invalid banner URL').optional().or(z.literal('')),
});

export const merchantLoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const merchantUpdateSchema = z.object({
    full_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
    phones: z.array(z.string()).optional(),
    store_name: z.string().min(1).optional(),
    descp: z.string().optional(),
    icon: z.string().url().optional().or(z.literal('')),
    banner: z.string().url().optional().or(z.literal('')),
    state: z.string().optional(),
    district: z.string().optional(),
    social_media: z.object({
        x: z.string().optional(),
        face_book: z.string().optional(),
        instagram: z.string().optional(),
    }).optional(),
});

// ---------- User ----------

export const userRegisterSchema = z.object({
    full_name: z.string().min(1, 'full name is required'),
    email: z.string().email('Please enter a valid email address'),
    phone: z.string().min(1, 'Phone is required'),
    password: passwordComplexity,
});

export const userLoginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
});

export const userUpdateSchema = z.object({
    full_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    phone: z.string().min(1).optional(),
});

// ---------- Shared ----------

export const changePasswordSchema = z.object({
    old_password: z.string().min(1, 'Old password is required'),
    new_password: passwordComplexity,
});

// ---------- Category ----------

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    image: z.string().url('Invalid image URL').optional().or(z.literal('')),
});

export const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    image: z.string().url().optional().or(z.literal('')),
});

// ---------- Product ----------

const variationDisplaySchema = z.object({
    type: z.enum(['image', 'text']),
    value: z.string(),
});

const variationOptionSchema = z.object({
    display: z.array(variationDisplaySchema).optional(),
    text: z.union([z.string(), z.number()]),
});

const variationSchema = z.object({
    type: z.string().min(1),
    text: z.string().min(1),
    content: z.array(variationOptionSchema),
});

const attribContentSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
});

const attribSchema = z.object({
    type: z.string().min(1),
    content: z.array(attribContentSchema),
});

export const createProductSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    descp: z.string().optional(),
    price: z.number().nonnegative('Price cannot be negative'),
    brand: z.string().optional(),
    quantity: z.number().int().nonnegative().default(0),
    images: z.array(z.string().url('Invalid image URL')).optional(),
    currency: z.string().optional(),
    min_qty: z.number().int().positive().optional(),
    max_qty: z.number().int().positive().optional(),
    discount: z.number().nonnegative().optional(),
    discount_expiration: z.string().datetime().optional().nullable().or(z.literal('')),
    has_refund_policy: z.boolean().optional(),
    has_discount: z.boolean().optional(),
    has_shipment: z.boolean().optional(),
    has_variation: z.boolean().optional(),
    shipping_locations: z.array(z.string()).optional(),
    attrib: z.array(attribSchema).optional(),
    variations: z.array(variationSchema).optional(),
    category_id: objectIdSchema,
});

export const updateProductSchema = createProductSchema.partial();

// ---------- Review / Rating / Like ----------

export const createReviewSchema = z.object({
    product_id: objectIdSchema,
    text: z.string().min(1, 'Review text is required'),
});

export const updateReviewSchema = z.object({
    text: z.string().min(1, 'Review text is required'),
});

export const upsertRatingSchema = z.object({
    product_id: objectIdSchema,
    text: z.string().optional(),
    value: z.number().int().min(1).max(5),
});

export const createLikeSchema = z.object({
    product_id: objectIdSchema,
});

// ---------- Cart ----------

export const addCartItemSchema = z.object({
    product_id: objectIdSchema,
    quantity: z.number().int().positive('Quantity must be at least 1'),
    has_variation: z.boolean().optional(),
    variation: z.object({
        color_index: z.number().int().nonnegative().optional().nullable(),
        size_index: z.number().int().nonnegative().optional().nullable(),
    }).optional(),
});

export const setCartNoteSchema = z.object({
    note: z.string().optional(),
});

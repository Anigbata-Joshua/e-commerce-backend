import multer from 'multer';
import path from 'path';
import ApiError from '../utils/ApiError.js';

const storage = multer.memoryStorage();

const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isImageMime = file.mimetype.startsWith('image/');
        const isImageExt = allowedExtensions.includes(ext);

        if (isImageMime || isImageExt) {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'Only image files are allowed'));
        }
    },
});

export default upload;
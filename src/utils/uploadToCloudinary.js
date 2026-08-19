import streamifier from 'streamifier';
import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = (buffer, folder = 'ecommerce') => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};
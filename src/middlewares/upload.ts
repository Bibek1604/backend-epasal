import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';

// Configure memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter to accept only images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Multer upload configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
});

// Export upload middleware
export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10); // Max 10 images
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

/**
 * Cloudinary upload helper
 */
import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';

export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'epasaley'
): Promise<string> => {
  // Allow disabling Cloudinary during tests to avoid external network calls
  if (process.env.DISABLE_CLOUDINARY === 'true') {
    return Promise.resolve('https://example.com/placeholder.jpg');
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          reject(new BadRequestError('Error uploading image to Cloudinary'));
        } else if (result) {
          resolve(result.secure_url);
        }
      }
    );

    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    // Extract public ID from URL
    const parts = imageUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts[parts.length - 2];
    const fullPublicId = `${folder}/${publicId}`;

    await cloudinary.uploader.destroy(fullPublicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

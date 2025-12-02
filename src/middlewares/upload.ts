import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { BadRequestError } from '../utils/errors';
import { cloudinary } from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * ============================================
 * CLOUDINARY-ONLY IMAGE UPLOAD
 * ============================================
 * All images are stored on Cloudinary.
 * No local /uploads folder is used.
 * Images load fast from Cloudinary CDN globally.
 */

// Use memory storage - files go directly to Cloudinary (not saved locally)
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
export const uploadMultiple = upload.array('images', 10);
export const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

/**
 * Upload image to Cloudinary
 * Returns the secure_url which is stored in the database
 */
export const uploadImage = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new BadRequestError('No file provided');
  }

  return await uploadToCloudinary(file);
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl) return;
  await deleteFromCloudinary(imageUrl);
};

// Backward compatibility aliases (controllers use these names)
export const uploadLocalImage = uploadImage;
export const deleteLocalImage = deleteImage;

/**
 * Upload to Cloudinary - returns the secure_url
 */
export const uploadToCloudinary = async (
  file: Express.Multer.File,
  folder: string = 'epasaley'
): Promise<string> => {
  // Allow disabling Cloudinary during tests
  if (process.env.DISABLE_CLOUDINARY === 'true') {
    return 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new BadRequestError('Failed to upload image to Cloudinary'));
        } else if (result) {
          // Return the secure HTTPS URL from Cloudinary
          resolve(result.secure_url);
        } else {
          reject(new BadRequestError('No result from Cloudinary'));
        }
      }
    );

    // Stream the file buffer to Cloudinary
    const bufferStream = new Readable();
    bufferStream.push(file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary using its URL
 */
export const deleteFromCloudinary = async (imageUrl: string): Promise<void> => {
  try {
    if (!imageUrl || !imageUrl.includes('cloudinary')) {
      // Skip if not a Cloudinary URL (e.g., old local paths)
      return;
    }

    // Extract public ID from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.ext
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;

    // Get everything after 'upload/v123456/' 
    const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
    // Remove file extension to get public_id
    const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
      console.log('Deleted from Cloudinary:', publicId);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw - deletion failure shouldn't break the main operation
  }
};

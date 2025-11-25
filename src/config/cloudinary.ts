import { v2 as cloudinary } from 'cloudinary';

const connectCloudinary = (): void => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('⚠️  Cloudinary credentials not found. Image upload will not work.');
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    console.log('✅ Cloudinary configured successfully');
  } catch (error) {
    console.error('❌ Error configuring Cloudinary:', error);
  }
};

export { cloudinary, connectCloudinary };

import { v2 as cloudinary } from 'cloudinary';

// ===========================================
// CLOUDINARY CONFIGURATION
// ===========================================
// All images are uploaded to Cloudinary CDN
// No local disk storage is used

/**
 * Initialize Cloudinary with credentials from environment
 */
const connectCloudinary = (): void => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  // Validate credentials
  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Cloudinary credentials missing in .env');
    console.error('   Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    return;
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // Always use HTTPS
  });

  console.log('✅ Cloudinary configured successfully');
  console.log(`   Cloud: ${cloudName}`);
};

export { cloudinary, connectCloudinary };

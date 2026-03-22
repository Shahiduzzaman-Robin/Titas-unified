const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

async function uploadLogo() {
  try {
    const result = await cloudinary.uploader.upload('public/logo.png', { 
        folder: 'titas/brand',
        public_id: 'logo' 
    });
    console.log('--- LOGO UPLOADED ---');
    console.log(result.secure_url);
    console.log('--- END ---');
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

uploadLogo();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dwybib7hh',
  api_key: '376472754524719',
  api_secret: 'XTPlCdcr9Td9o6GkjiMtsgQf2LI'
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

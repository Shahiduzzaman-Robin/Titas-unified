export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  // If it's already a Cloudinary URL, we can transform it
  if (src.includes('res.cloudinary.com')) {
    // Check if it already has transformations
    if (src.includes('/image/upload/')) {
        const params = [`w_${width}`, `c_limit`, `f_auto`, `q_${quality || 'auto'}`];
        return src.replace('/image/upload/', `/image/upload/${params.join(',')}/`);
    }
  }
  return src;
}

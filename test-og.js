
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const post = await prisma.blog_posts.findFirst({
    where: { status: 'published', NOT: { featuredImage: null } },
    select: { title: true, slug: true, featuredImage: true }
  });

  if (!post) {
    console.log("No post found");
    return;
  }

  const baseUrl = 'https://titaas.vercel.app';
  const locale = 'bn';
  const canonicalUrl = `${baseUrl}/${locale}/blog/${encodeURIComponent(post.slug)}`;
  
  let sourceImage = post.featuredImage || `${baseUrl}/og-default.png`;
  if (sourceImage && !sourceImage.startsWith('http')) {
      sourceImage = `${baseUrl}${sourceImage.startsWith('/') ? '' : '/'}${sourceImage}`;
  }
  
  const ogImage = `${baseUrl}/api/og?image=${encodeURIComponent(sourceImage)}`;
  
  console.log("Post Title:", post.title);
  console.log("Post Slug:", post.slug);
  console.log("Featured Image:", post.featuredImage);
  console.log("Source Image:", sourceImage);
  console.log("OG Image URL:", ogImage);
  console.log("Canonical URL:", canonicalUrl);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

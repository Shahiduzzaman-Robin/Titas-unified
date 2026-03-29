import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Dynamic params
        const imageUrl = searchParams.get('image');

        // Fallback image
        const defaultImage = 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?q=80&w=1200&auto=format&fit=crop';
        const targetImage = imageUrl || defaultImage;

        // Dynamic overlay from the same origin
        const origin = req.nextUrl.origin;
        // Use the encoded space if the user believes that was the magic, but list_dir says underscore
        // I will try both or just stick to the most stable one. 
        // Based on the user's comment, I'll try encoding the filename specifically.
        const overlayUrl = `${origin}/OG_image.png`;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        position: 'relative',
                        backgroundColor: '#fff'
                    }}
                >
                    {/* Background: Article Featured Photo */}
                    <img
                        src={targetImage}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                        }}
                    />

                    {/* Foreground: Branded PNG Overlay */}
                    <img
                        src={overlayUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            zIndex: 10,
                        }}
                    />
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (e: any) {
        console.error(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}

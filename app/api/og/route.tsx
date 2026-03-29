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

        // Force a fresh fetch of the branding asset with a timestamp
        const baseUrl = 'https://titaas.vercel.app';
        const overlayUrl = `${baseUrl}/titas-branding.png?v=${Date.now()}`;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        position: 'relative',
                        backgroundColor: '#fff',
                    }}
                >
                    {/* Background Layer */}
                    <img
                        src={targetImage}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1200px',
                            height: '630px',
                            objectFit: 'cover',
                        }}
                    />

                    {/* Branding Layer */}
                    <img
                        src={overlayUrl}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '1200px',
                            height: '630px',
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

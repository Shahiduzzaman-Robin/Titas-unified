import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Dynamic params
        const imageUrl = searchParams.get('image');

        // Fallback images
        const defaultImage = 'https://images.unsplash.com/photo-1546422904-90eab23c3d7e?q=80&w=1200&auto=format&fit=crop';
        const targetImage = imageUrl || defaultImage;

        // Base domain (for fetching the logo if needed, or simply text)
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        // Use specific production URL to guarantee Satori can fetch the logo even during local development
        const logoUrl = 'https://titaas.vercel.app/logo.png';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#fff',
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Main Image Area (Top 85%) */}
                    <div style={{ display: 'flex', height: '85%', width: '100%', overflow: 'hidden' }}>
                        <img
                            src={targetImage}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>

                    {/* Branding Bar / Bottom Strip (Bottom 15%) */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            height: '15%',
                            width: '100%',
                            backgroundColor: '#ffffff',
                            padding: '0 40px',
                            borderTop: '6px solid #027B6D', // Titas Green border
                            boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
                        }}
                    >
                        {/* Left Side: Logo & Text */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <img
                                src={logoUrl}
                                height="60"
                                width="60"
                                style={{ borderRadius: '50%', objectFit: 'contain' }}
                            />
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    marginLeft: '16px',
                                }}
                            >
                                <span style={{ fontSize: '28px', fontWeight: '800', color: '#222', letterSpacing: '-0.5px' }}>
                                    TITAS
                                </span>
                                <span style={{ fontSize: '18px', color: '#666', fontWeight: '500' }}>
                                    Dhaka University Student's Welfare Association of Brahmanbaria
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Website URL / Tagline */}
                        <div style={{ display: 'flex' }}>
                            <span style={{ fontSize: '32px', fontWeight: '900', color: '#175264', letterSpacing: '-0.5px' }}>
                                titasdu.com
                            </span>
                        </div>
                    </div>
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

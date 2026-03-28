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
        const logoUrl = `${appUrl}/logo.png`;

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
                    <div
                        style={{
                            display: 'flex',
                            height: '85%',
                            width: '100%',
                            backgroundImage: `url(${targetImage})`,
                            backgroundSize: '100% 100%',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />

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
                            borderTop: '6px solid #e21b22', // Signature Titas Red
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
                                    তিতাস
                                </span>
                                <span style={{ fontSize: '18px', color: '#666', fontWeight: '500' }}>
                                    ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Website URL / Tagline */}
                        <div style={{ display: 'flex' }}>
                            <span style={{ fontSize: '24px', fontWeight: '700', color: '#e21b22' }}>
                                titas-du.org
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

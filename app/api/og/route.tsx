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

        // Base domain
        const baseUrl = 'https://titaas.vercel.app';
        const logoUrl = `${baseUrl}/logo.png`;

        // Fetch Noto Sans Bengali TTF — Satori only supports TTF/OTF (not woff2)
        const fontData = await fetch(
            `${baseUrl}/fonts/NotoSansBengali-Regular.ttf`
        ).then((res) => res.arrayBuffer());

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: '#fff',
                        fontFamily: 'BanglaFont',
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
                            backgroundImage: 'linear-gradient(to right, #052e35, #0a4f5d)',
                            padding: '0 40px',
                            boxShadow: '0 -4px 10px rgba(0,0,0,0.3)',
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
                                <span style={{ fontSize: '32px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.5px' }}>
                                    তিতাস
                                </span>
                                <span style={{ fontSize: '18px', color: '#94a3b8', fontWeight: '500' }}>
                                    ঢাকা বিশ্ববিদ্যালয়স্থ ব্রাহ্মণবাড়িয়া জেলা ছাত্রকল্যাণ পরিষদ
                                </span>
                            </div>
                        </div>

                        {/* Right Side: Website URL / Tagline */}
                        <div style={{ display: 'flex' }}>
                            <span style={{ fontSize: '32px', fontWeight: '900', color: '#38bdf8', letterSpacing: '-0.5px' }}>
                                titasdu.com
                            </span>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                fonts: [
                    {
                        name: 'BanglaFont',
                        data: fontData,
                        style: 'normal',
                    },
                ],
            }
        );
    } catch (e: any) {
        console.error(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}

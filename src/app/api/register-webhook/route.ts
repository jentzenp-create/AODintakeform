import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Forward to GoHighLevel webhook
        const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/GbCBWto1fZMUlB2SRAJY/webhook-trigger/5db71eae-9974-40f8-9549-c0baaecf304c';

        const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!ghlResponse.ok) {
            console.error('Failed to send to GHL:', ghlResponse.status, ghlResponse.statusText);
            return NextResponse.json({ error: 'Failed to forward to GHL' }, { status: 502 });
        }

        return NextResponse.json({ success: true, message: 'Data successfully sent to GHL' });
    } catch (error) {
        console.error('Webhook API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

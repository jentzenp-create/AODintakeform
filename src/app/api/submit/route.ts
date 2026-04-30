import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { referrer, name, phone, email, business_name, goals, connections } = body;

        // Validate required fields
        if (!referrer || !name || !phone || !email || !business_name) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = getSupabase();
        const { data, error } = await supabase
            .from('form_submissions')
            .insert([
                {
                    referrer,
                    name,
                    phone,
                    email,
                    business_name,
                    goals,
                    connections,
                    submitted_at: new Date().toISOString(),
                },
            ])
            .select();

        if (error) {
            console.error('Supabase error:', error);
            return NextResponse.json(
                { error: 'Failed to save submission' },
                { status: 500 }
            );
        }

        // Forward to GoHighLevel webhook
        // The user needs to create a workflow in GHL triggered by an Inbound Webhook
        // and put the URL here or in an environment variable.
        const GHL_WEBHOOK_URL = process.env.GHL_INTAKE_WEBHOOK_URL; 
        
        if (GHL_WEBHOOK_URL) {
            try {
                const ghlResponse = await fetch(GHL_WEBHOOK_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        referrer,
                        name,
                        phone,
                        email,
                        business_name,
                        goals,
                        connections,
                        source: 'AOD Intake Form'
                    }),
                });

                if (!ghlResponse.ok) {
                    console.error('Failed to send to GHL:', ghlResponse.status, ghlResponse.statusText);
                    // We don't fail the submission if GHL fails, just log it
                }
            } catch (ghlError) {
                console.error('Webhook API error:', ghlError);
            }
        } else {
            console.warn('GHL_INTAKE_WEBHOOK_URL is not set. Skipping GoHighLevel integration.');
        }

        return NextResponse.json(
            { message: 'Submission saved successfully', data },
            { status: 200 }
        );
    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

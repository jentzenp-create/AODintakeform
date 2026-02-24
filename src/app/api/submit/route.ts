import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { name, phone, email, business_name, passion, fun_fact, goals, connections } = body;

        // Validate required fields
        if (!name || !phone || !email || !business_name) {
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
                    name,
                    phone,
                    email,
                    business_name,
                    passion,
                    fun_fact,
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

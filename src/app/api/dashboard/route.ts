import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
    try {
        // Simple auth check via header
        const authToken = request.headers.get('x-dashboard-key');
        const dashboardKey = process.env.DASHBOARD_SECRET_KEY;

        if (!dashboardKey || authToken !== dashboardKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = new URL(request.url).searchParams;
        const search = searchParams.get('search') || '';
        const referrer = searchParams.get('referrer') || '';
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

        const supabase = getSupabase();

        // Use the RPC function for efficient server-side search + pagination
        const { data, error } = await supabase.rpc('search_submissions', {
            search_query: search,
            referrer_filter: referrer, // Note: you'll need to update the Supabase RPC to accept this!
            page_number: page,
            page_size: Math.min(pageSize, 100), // Cap at 100
        });

        if (error) {
            console.error('Supabase RPC error or RPC not updated yet:', error);

            // Fallback: direct query if RPC doesn't exist yet
            return await fallbackQuery(supabase, search, referrer, page, pageSize);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authToken = request.headers.get('x-dashboard-key');
        const dashboardKey = process.env.DASHBOARD_SECRET_KEY;

        if (!dashboardKey || authToken !== dashboardKey) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const supabase = getSupabase();
        const { error } = await supabase
            .from('form_submissions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Supabase delete error:', error);
            return NextResponse.json({ error: 'Failed to delete submission' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Dashboard Delete API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fallbackQuery(supabase: any, search: string, referrer: string, page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    let query = supabase
        .from('form_submissions')
        .select('*', { count: 'exact' })
        .order('submitted_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

    if (search) {
        query = query.or(
            `name.ilike.%${search}%,business_name.ilike.%${search}%,email.ilike.%${search}%,passion.ilike.%${search}%,goals.ilike.%${search}%,connections.ilike.%${search}%,referrer.ilike.%${search}%`
        );
    }

    if (referrer) {
        query = query.eq('referrer', referrer);
    }

    const { data, count, error } = await query;

    if (error) {
        console.error('Fallback query error:', error);
        return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    const total = count || 0;

    return NextResponse.json({
        data: data || [],
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
    });
}

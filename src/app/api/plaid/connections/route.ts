import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch plaid items WITHOUT exposing access_token
    const { data: items, error } = await supabase
      .from('plaid_items')
      .select('id, institution_name, institution_id, last_synced_at, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch connections:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    return NextResponse.json({ connections: items || [] });
  } catch (error) {
    console.error('Connections error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const assetType = searchParams.get('type'); // 'crypto' or 'stock'
  const days = parseInt(searchParams.get('days') || '90', 10);

  if (!symbol || !assetType) {
    return NextResponse.json({ error: 'Missing symbol or type' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from('price_history')
    .select('date, price')
    .eq('symbol', symbol.toUpperCase())
    .eq('asset_type', assetType)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ history: data || [] });
}

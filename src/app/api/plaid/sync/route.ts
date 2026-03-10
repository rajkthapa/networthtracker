import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid';
import { mapPlaidCategory } from '@/lib/plaid-mappings';

function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    }
  );
}

function createAuthClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) {
          try { cookieStore.set({ name, value, ...options }); } catch {}
        },
        remove(name: string, options: any) {
          try { cookieStore.set({ name, value: '', ...options }); } catch {}
        },
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const authClient = createAuthClient();
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plaid_item_id } = await request.json();
    if (!plaid_item_id) {
      return NextResponse.json({ error: 'Missing plaid_item_id' }, { status: 400 });
    }

    // Get the plaid item (service role to read access_token)
    const serviceClient = createServiceClient();
    const { data: plaidItem, error: itemError } = await serviceClient
      .from('plaid_items')
      .select('*')
      .eq('id', plaid_item_id)
      .eq('user_id', user.id)
      .single();

    if (itemError || !plaidItem) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Get account mapping
    const { data: plaidAccounts } = await serviceClient
      .from('plaid_accounts')
      .select('plaid_account_id, app_account_id')
      .eq('plaid_item_id', plaid_item_id);

    const accountMap = new Map(
      (plaidAccounts || []).map((a: any) => [a.plaid_account_id, a.app_account_id])
    );

    // Incremental sync using cursor
    let cursor = plaidItem.cursor || '';
    let added: any[] = [];
    let modified: any[] = [];
    let removed: any[] = [];
    let hasMore = true;

    while (hasMore) {
      const syncResponse = await plaidClient.transactionsSync({
        access_token: plaidItem.access_token,
        cursor: cursor || undefined,
      });

      added = added.concat(syncResponse.data.added);
      modified = modified.concat(syncResponse.data.modified);
      removed = removed.concat(syncResponse.data.removed);
      hasMore = syncResponse.data.has_more;
      cursor = syncResponse.data.next_cursor;
    }

    // Process added transactions
    let importedCount = 0;
    if (added.length > 0) {
      const rows = added.map(tx => {
        const isExpense = tx.amount > 0;
        const primaryCategory = tx.personal_finance_category?.primary || null;
        const detailedCategory = tx.personal_finance_category?.detailed || primaryCategory;

        return {
          user_id: user.id,
          date: tx.date,
          description: tx.name || tx.merchant_name || 'Unknown',
          amount: Math.abs(tx.amount),
          type: isExpense ? 'expense' : 'income',
          category: mapPlaidCategory(detailedCategory, isExpense),
          account_id: accountMap.get(tx.account_id) || null,
          notes: tx.merchant_name ? `Merchant: ${tx.merchant_name}` : null,
          plaid_transaction_id: tx.transaction_id,
        };
      });

      const { error: txError } = await authClient
        .from('transactions')
        .upsert(rows, { onConflict: 'plaid_transaction_id', ignoreDuplicates: true });

      if (!txError) importedCount = rows.length;
    }

    // Process removed transactions
    let removedCount = 0;
    if (removed.length > 0) {
      const removedIds = removed.map((r: any) => r.transaction_id);
      const { error: delError } = await authClient
        .from('transactions')
        .delete()
        .in('plaid_transaction_id', removedIds);

      if (!delError) removedCount = removedIds.length;
    }

    // Refresh account balances
    let balancesUpdated = 0;
    try {
      const balanceResponse = await plaidClient.accountsGet({
        access_token: plaidItem.access_token,
      });

      for (const acct of balanceResponse.data.accounts) {
        const appAccountId = accountMap.get(acct.account_id);
        if (!appAccountId) continue;

        const balance = acct.balances.current || 0;
        await authClient
          .from('accounts')
          .update({ balance: Math.abs(balance), updated_at: new Date().toISOString() })
          .eq('id', appAccountId);
        balancesUpdated++;
      }
    } catch (e) {
      console.error('Failed to refresh balances:', e);
    }

    // Update cursor and last_synced_at
    await serviceClient
      .from('plaid_items')
      .update({ cursor, last_synced_at: new Date().toISOString() })
      .eq('id', plaid_item_id);

    return NextResponse.json({
      success: true,
      transactions_added: importedCount,
      transactions_removed: removedCount,
      balances_updated: balancesUpdated,
    });
  } catch (error: any) {
    console.error('Plaid sync error:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}

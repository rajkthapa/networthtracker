import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { plaidClient } from '@/lib/plaid';
import { mapPlaidAccountType, mapPlaidCategory } from '@/lib/plaid-mappings';

// Create a service-role client for writing access_tokens to plaid_items
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

// Create an auth-scoped client for the current user
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

    const { public_token } = await request.json();
    if (!public_token) {
      return NextResponse.json({ error: 'Missing public_token' }, { status: 400 });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const { access_token, item_id } = exchangeResponse.data;

    // Get institution info
    const itemResponse = await plaidClient.itemGet({ access_token });
    const institutionId = itemResponse.data.item.institution_id;
    let institutionName = 'Unknown Bank';
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: ['US'] as any,
        });
        institutionName = instResponse.data.institution.name;
      } catch {}
    }

    // Store Plaid item with service role (access_token is sensitive)
    const serviceClient = createServiceClient();
    const { data: plaidItem, error: itemError } = await serviceClient
      .from('plaid_items')
      .insert({
        user_id: user.id,
        plaid_item_id: item_id,
        access_token,
        institution_name: institutionName,
        institution_id: institutionId,
      })
      .select()
      .single();

    if (itemError) {
      console.error('Failed to store plaid item:', itemError);
      return NextResponse.json({ error: 'Failed to store connection' }, { status: 500 });
    }

    // Fetch accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const plaidAccounts = accountsResponse.data.accounts;

    const createdAccounts: { plaidAccountId: string; appAccountId: string }[] = [];

    for (const plaidAccount of plaidAccounts) {
      const mapping = mapPlaidAccountType(plaidAccount.type, plaidAccount.subtype || null);
      const balance = plaidAccount.balances.current || 0;

      // Create app account (as the user via auth client)
      const { data: appAccount, error: acctError } = await authClient
        .from('accounts')
        .insert({
          user_id: user.id,
          name: plaidAccount.name,
          type: mapping.appType,
          balance: mapping.isDebt ? Math.abs(balance) : balance,
          institution: institutionName,
          color: mapping.color,
          icon: mapping.icon,
          is_debt: mapping.isDebt,
        })
        .select()
        .single();

      if (acctError) {
        console.error('Failed to create account:', acctError);
        continue;
      }

      // Link plaid account to app account
      await serviceClient.from('plaid_accounts').insert({
        user_id: user.id,
        plaid_item_id: plaidItem.id,
        plaid_account_id: plaidAccount.account_id,
        app_account_id: appAccount.id,
      });

      createdAccounts.push({
        plaidAccountId: plaidAccount.account_id,
        appAccountId: appAccount.id,
      });
    }

    // Fetch last 90 days of transactions
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const startDate = ninetyDaysAgo.toISOString().split('T')[0];
    const endDate = now.toISOString().split('T')[0];

    let transactions: any[] = [];
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const txResponse = await plaidClient.transactionsGet({
        access_token,
        start_date: startDate,
        end_date: endDate,
        options: { count: 500, offset },
      });
      transactions = transactions.concat(txResponse.data.transactions);
      hasMore = transactions.length < txResponse.data.total_transactions;
      offset = transactions.length;
    }

    // Map account IDs for transaction linking
    const accountMap = new Map(
      createdAccounts.map(a => [a.plaidAccountId, a.appAccountId])
    );

    // Insert transactions
    let importedCount = 0;
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const rows = batch.map(tx => {
        // Plaid: positive amount = money out (expense), negative = money in (income)
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

      if (txError) {
        console.error('Failed to insert transactions batch:', txError);
      } else {
        importedCount += rows.length;
      }
    }

    // Store initial cursor for future syncs
    try {
      const syncResponse = await plaidClient.transactionsSync({
        access_token,
      });
      await serviceClient
        .from('plaid_items')
        .update({ cursor: syncResponse.data.next_cursor, last_synced_at: new Date().toISOString() })
        .eq('id', plaidItem.id);
    } catch (e) {
      console.error('Failed to get initial sync cursor:', e);
    }

    return NextResponse.json({
      success: true,
      accounts_created: createdAccounts.length,
      transactions_imported: importedCount,
      institution: institutionName,
    });
  } catch (error: any) {
    console.error('Plaid exchange error:', error?.response?.data || error);
    return NextResponse.json(
      { error: 'Failed to connect bank account' },
      { status: 500 }
    );
  }
}

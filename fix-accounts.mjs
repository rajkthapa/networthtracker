import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const envFile = readFileSync('.env.local', 'utf-8');
const env = {};
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const userId = '42bab2c0-40f3-4608-beb8-82c4d21a06c5';

// First, see all accounts and their types
const { data: accounts } = await supabase.from('accounts').select('id, name, type').eq('user_id', userId);
console.log('All accounts:');
accounts.forEach(a => console.log(`  ${a.name} -> type: ${a.type}`));

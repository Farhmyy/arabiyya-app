/* Supabase initialization — exposes sbClient globally */

const SUPABASE_URL  = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY';

window.sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

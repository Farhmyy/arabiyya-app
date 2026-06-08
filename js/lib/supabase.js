/* Supabase client — exposes sbClient globally */

const SUPABASE_URL  = 'https://ptasitilbnhzeegmvydy.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0YXNpdGlsYm5oemVlZ212eWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4NDQ2MDIsImV4cCI6MjA5NjQyMDYwMn0.nMJ_iwvz52kOSMnfDnWdIEb2WqXogdoG2_yaqj3E0Yw';

window.sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

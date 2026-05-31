/* Supabase client — exposes sbClient globally */

const SUPABASE_URL  = 'https://aehzbecaoxhtffhisxmd.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlaHpiZWNhb3hodGZmaGlzeG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxODI3NDgsImV4cCI6MjA5NTc1ODc0OH0._xiB2PiR-c68ND5b_gNieB5N0fJHW5-OncO8KTXHr1I';

window.sbClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

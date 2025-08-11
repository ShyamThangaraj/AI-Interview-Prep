import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ucmgiiqubvudoyhkezsr.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbWdpaXF1YnZ1ZG95aGtlenNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODQ1MTgsImV4cCI6MjA3MDQ2MDUxOH0.gXwxTHtPUNBfpHLDe0vNjJaxgkCShp49CnLSNtP35x8'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
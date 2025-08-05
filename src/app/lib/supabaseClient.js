import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://tqvrmetiwevhmbttnpvc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdnJtZXRpd2V2aG1idHRucHZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwODkzNDQsImV4cCI6MjA2OTY2NTM0NH0.S_vHNjTWwczuLNwkf6h5cG5fL1qmYtaF-h9ngliFh3M'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
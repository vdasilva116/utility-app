import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL='https://rxhbbaucbswnfqvtbnhh.supabase.co'
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4aGJiYXVjYnN3bmZxdnRibmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MDcyNDksImV4cCI6MjA2MzQ4MzI0OX0.szce_h2WiVKN2PThNCVbuwBi7NcWRm01QwDFFsKUi3o'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://foutildjkjmdgqvfwads.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvdXRpbGRqa2ptZGdxdmZ3YWRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTg4NjIsImV4cCI6MjA4MTQ3NDg2Mn0._PARIZb0XNh59YYojPw-4fb9H9tDzp80t1lPk1eIkF4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

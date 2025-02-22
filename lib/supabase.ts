// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://itajnpinmtxjqsbryzvg.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YWpucGlubXR4anFzYnJ5enZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAyMjc0MTksImV4cCI6MjA1NTgwMzQxOX0.M1ZjVl6SyqkhpHCCDpIJdtpaoXla0Cot4y9z4xl6nqo";

export const supabase = createClient(supabaseUrl, supabaseKey);

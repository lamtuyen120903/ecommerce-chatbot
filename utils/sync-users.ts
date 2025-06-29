import { supabase } from "../lib/supabase";

// Note: These functions should only be used server-side with proper authentication
// They are kept here for reference but should be moved to API routes if needed

export async function syncUsersFromAuth() {
  console.warn("This function should be used server-side only");
  return;
}

export async function syncSingleUser(userId: string) {
  console.warn("This function should be used server-side only");
  return false;
}

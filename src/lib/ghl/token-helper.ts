import { createClient } from '@/lib/supabase/server';

interface GhlIntegration {
  access_token: string;
  refresh_token: string;
  location_id: string;
}

export async function getGhlAccessToken(userId: string, integrationLabel?: string): Promise<GhlIntegration | null> {
  const supabase = createClient();

  if (integrationLabel) {
    // Fetch from ghl_integrations table
    const { data, error } = await supabase
      .from('ghl_integrations')
      .select('access_token, refresh_token, location_id')
      .eq('user_id', userId)
      .eq('label', integrationLabel)
      .single();

    if (error || !data) {
      console.error(`Error fetching GHL integration for label ${integrationLabel}:`, error);
      return null;
    }

    // TODO: Add token refresh logic for ghl_integrations table
    return data;

  } else {
    // Default to fetching from profiles table (existing behavior)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('ghl_access_token, ghl_refresh_token, ghl_location_id')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching GHL profile data:', profileError);
      return null;
    }

    // This assumes refreshGhlToken handles the update in the profiles table
    // For now, directly return if tokens exist.
    // Full refresh logic should be in a separate, shared utility if needed.
    if (profileData.ghl_access_token && profileData.ghl_refresh_token && profileData.ghl_location_id) {
      return {
        access_token: profileData.ghl_access_token,
        refresh_token: profileData.ghl_refresh_token,
        location_id: profileData.ghl_location_id,
      };
    }
  }

  return null;
}


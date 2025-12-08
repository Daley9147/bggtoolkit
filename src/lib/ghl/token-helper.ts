import { createClient } from '@/lib/supabase/server';
import { refreshGhlToken } from '@/lib/ghl/auth';

interface GhlIntegration {
  access_token: string;
  refresh_token: string;
  location_id: string;
  expires_at: string;
}

export async function getGhlAccessToken(userId: string, integrationLabel?: string): Promise<GhlIntegration | null> {
  const supabase = createClient();

  if (integrationLabel) {
    // Fetch from ghl_integrations table
    const { data, error } = await supabase
      .from('ghl_integrations')
      .select('access_token, refresh_token, location_id, expires_at')
      .eq('user_id', userId)
      .eq('label', integrationLabel)
      .single();

    if (error || !data) {
      console.error(`Error fetching GHL integration for label ${integrationLabel}:`, error);
      return null;
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    // Refresh token if it expires within the next 5 minutes
    if (expiresAt.getTime() < now.getTime() + 5 * 60 * 1000) {
      console.log(`Refreshing expired GHL token for integration: ${integrationLabel}`);
      try {
        const refreshedTokens = await refreshGhlToken(data.refresh_token, userId, supabase, integrationLabel);
        return {
          access_token: refreshedTokens.accessToken,
          refresh_token: data.refresh_token, // The refresh token might not change, but we'll keep the old one for now.
          location_id: refreshedTokens.locationId,
          expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // Assuming 1 hour expiry for new token
        };
      } catch (refreshError) {
        console.error(`Failed to refresh GHL token for integration ${integrationLabel}:`, refreshError);
        return null;
      }
    }
    return data;

  } else {
    // Default to fetching from profiles table (existing behavior)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('ghl_access_token, ghl_refresh_token, ghl_location_id, ghl_token_expires_at')
      .eq('id', userId)
      .single();

    if (profileError || !profileData) {
      console.error('Error fetching GHL profile data:', profileError);
      return null;
    }

    if (profileData.ghl_access_token && profileData.ghl_refresh_token && profileData.ghl_location_id && profileData.ghl_token_expires_at) {
      const now = new Date();
      const expiresAt = new Date(profileData.ghl_token_expires_at);

      // Refresh token if it expires within the next 5 minutes
      if (expiresAt.getTime() < now.getTime() + 5 * 60 * 1000) {
        console.log('Refreshing expired GHL token for primary profile.');
        try {
          const refreshedTokens = await refreshGhlToken(profileData.ghl_refresh_token, userId, supabase);
          return {
            access_token: refreshedTokens.accessToken,
            refresh_token: profileData.ghl_refresh_token,
            location_id: refreshedTokens.locationId,
            expires_at: new Date(Date.now() + 3600 * 1000).toISOString(), // Assuming 1 hour expiry for new token
          };
        } catch (refreshError) {
          console.error('Failed to refresh primary GHL token:', refreshError);
          return null;
        }
      }
      return {
        access_token: profileData.ghl_access_token,
        refresh_token: profileData.ghl_refresh_token,
        location_id: profileData.ghl_location_id,
        expires_at: profileData.ghl_token_expires_at,
      };
    }
  }

  return null;
}


import { createClient } from '@/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';

interface GhlTokenData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  locationId: string;
}

export async function refreshGhlToken(refreshToken: string, userId: string, supabase: SupabaseClient) {
  const GHL_CLIENT_ID = process.env.GHL_CLIENT_ID;
  const GHL_CLIENT_SECRET = process.env.GHL_CLIENT_SECRET;

  const params = new URLSearchParams({
    client_id: GHL_CLIENT_ID || '',
    client_secret: GHL_CLIENT_SECRET || '',
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch('https://services.leadconnectorhq.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GHL Token Refresh Error:', errorData);
      throw new Error('Failed to refresh GHL token.');
    }

    const data: GhlTokenData = await response.json();

    const expires_at = new Date(Date.now() + data.expires_in * 1000);

    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ghl_access_token: data.access_token,
        ghl_refresh_token: data.refresh_token,
        ghl_token_expires_at: expires_at.toISOString(),
        ghl_location_id: data.locationId,
      });

    if (upsertError) {
      console.error('Error upserting profile with refreshed GHL tokens:', upsertError);
      throw new Error('Failed to save refreshed GHL tokens to profile.');
    }

    return {
      accessToken: data.access_token,
      locationId: data.locationId,
    };
  } catch (error) {
    console.error('Error refreshing GHL token:', error);
    throw error;
  }
}

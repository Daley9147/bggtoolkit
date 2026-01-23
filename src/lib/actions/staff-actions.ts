'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server'; // For auth check

export async function createStaffAccount(formData: FormData) {
  // 1. Verify Admin Access
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && user.email !== 'darrel@missionmetrics.io') {
    throw new Error('Forbidden: Only admins can add staff.');
  }

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  // 2. Initialize Admin Client
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 3. Create User
  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName }
  });

  if (createError) {
    throw new Error(createError.message);
  }

  if (!newUser.user) throw new Error('Failed to create user object');

  // 4. Create Profile (if trigger didn't handle it, or to set specifics)
  // The trigger 'handle_new_user' should have run.
  // We can update the profile to set status active explicitly if needed.
  
  // 5. Create Default Pipeline
  const { error: pipeError } = await supabaseAdmin
    .from('pipelines')
    .insert({
      user_id: newUser.user.id,
      name: 'Sales Pipeline'
    })
    .select()
    .single();

  if (pipeError) {
      console.error('Failed to create default pipeline:', pipeError);
      // Don't fail the whole request, account is created.
  } else {
      // Create stages? Logic is in API/upload route usually, but good to have here.
      // We need pipeline ID.
      // Let's query it back or use returned data if insert returns it.
      // (Using .select().single() above)
  }

  // Since we used admin client, RLS is bypassed. 
  // We should fetch the pipeline we just created to add stages.
  const { data: pipeline } = await supabaseAdmin.from('pipelines').select('id').eq('user_id', newUser.user.id).single();
  
  if (pipeline) {
      const stages = ['New Lead', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
      await supabaseAdmin.from('stages').insert(
        stages.map((name, i) => ({ pipeline_id: pipeline.id, name, position: i }))
      );
  }

  return { success: true };
}

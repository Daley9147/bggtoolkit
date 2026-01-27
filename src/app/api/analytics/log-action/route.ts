import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, details, entity_type, entity_id } = await request.json()

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('logged_actions')
    .insert([{ 
      user_id: user.id, 
      action_type: action,
      entity_type: entity_type || 'system',
      entity_id: entity_id || null,
      metadata: details || {}
    }])

  if (error) {
    console.error('Error logging action:', error)
    return NextResponse.json({ error: 'Failed to log action' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Action logged successfully' })
}

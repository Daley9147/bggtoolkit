import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { action, details } = await request.json()

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('logged_actions')
    .insert([{ 
      user_id: user.id, 
      action,
      details
    }])

  if (error) {
    console.error('Error logging action:', error)
    return NextResponse.json({ error: 'Failed to log action' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Action logged successfully' })
}

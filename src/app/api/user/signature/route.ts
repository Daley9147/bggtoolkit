import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('email_signature')
    .eq('id', session.user.id)
    .single()

  if (error) {
    console.error('Error fetching email signature:', error)
    return NextResponse.json({ error: 'Error fetching signature' }, { status: 500 })
  }

  return NextResponse.json({ email_signature: data?.email_signature || '' })
}

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { email_signature } = await request.json()

  const { error } = await supabase
    .from('profiles')
    .update({ email_signature })
    .eq('id', session.user.id)

  if (error) {
    console.error('Error updating email signature:', error)
    return NextResponse.json({ error: 'Error updating signature' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Signature updated successfully' })
}

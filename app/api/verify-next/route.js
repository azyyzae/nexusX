import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateKey } from '@/lib/key-utils'

export async function POST(request) {
  const { token } = await request.json()
  const sessionId = request.cookies.get('k_session')?.value
  const bypassFlag = request.cookies.get('k_bypass')?.value

  if (!sessionId || !token) {
    return NextResponse.json({ success: false, redirect: '/key?error=invalid_session' })
  }

  if (bypassFlag === 'true') {
    return NextResponse.json({ success: false, redirect: '/key?error=bypass' })
  }

  const supabase = getSupabase()

  if (supabase) {
    const { data: existing } = await supabase
      .from('keys')
      .select('key_value')
      .eq('session_id', sessionId)
      .maybeSingle()

    if (existing) {
      const response = NextResponse.json({ success: true, redirect: '/key' })
      response.cookies.set('k_key', existing.key_value, { httpOnly: false, maxAge: 43200, path: '/' })
      response.cookies.set('k_checkpoint', '3', { httpOnly: false, maxAge: 43200, path: '/' })
      return response
    }
  }

  const key = generateKey()
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString()

  if (supabase) {
    const { error } = await supabase.from('keys').insert({
      key_value: key,
      status: 'active',
      session_id: sessionId,
      expires_at: expiresAt
    })
    if (error) {
      return NextResponse.json({ success: false, redirect: '/key?error=db_error' })
    }
  }

  const response = NextResponse.json({ success: true, redirect: '/key' })
  response.cookies.set('k_key', key, { httpOnly: false, maxAge: 43200, path: '/' })
  response.cookies.set('k_checkpoint', '3', { httpOnly: false, maxAge: 43200, path: '/' })
  response.cookies.set('k_expires', expiresAt, { httpOnly: false, maxAge: 43200, path: '/' })
  return response
}

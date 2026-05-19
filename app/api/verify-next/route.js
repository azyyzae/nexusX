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

  const key = generateKey()

  const supabase = getSupabase()
  if (supabase) {
    try {
      await supabase.from('keys').insert({
        key_value: key,
        status: 'active',
        session_id: sessionId
      })

      await supabase.from('sessions').update({
        checkpoint: 3,
        temp_token: null,
        temp_token_expiry: null
      }).eq('session_id', sessionId)
    } catch (e) {}
  }

  const response = NextResponse.json({ success: true, redirect: '/key' })

  response.cookies.set('k_key', key, { httpOnly: false, maxAge: 1800, path: '/' })
  response.cookies.set('k_checkpoint', '3', { httpOnly: false, maxAge: 1800, path: '/' })

  return response
}

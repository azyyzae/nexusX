import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateKey, generateToken } from '@/lib/key-utils'

export async function POST(request) {
  const { token, bypassDetected } = await request.json()
  const sessionId = request.cookies.get('k_session')?.value
  const bypassFlag = request.cookies.get('k_bypass')?.value

  if (!sessionId || !token) {
    return NextResponse.json({ success: false, redirect: '/key?error=invalid_session' })
  }

  if (bypassFlag === 'true' || bypassDetected) {
    return NextResponse.json({ success: false, redirect: '/key?error=bypass' })
  }

  const supabase = getSupabase()
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .single()

  if (!session || session.bypass_attempted) {
    return NextResponse.json({ success: false, redirect: '/key?error=bypass' })
  }

  if (session.checkpoint !== 2 || session.temp_token !== token) {
    return NextResponse.json({ success: false, redirect: '/key?error=invalid_token' })
  }

  if (new Date(session.temp_token_expiry) < new Date()) {
    return NextResponse.json({ success: false, redirect: '/key?error=expired_token' })
  }

  const key = generateKey()
  const newSessionId = generateToken()

  const { error: keyError } = await supabase.from('keys').insert({
    key_value: key,
    status: 'active',
    session_id: sessionId
  })

  if (keyError) {
    return NextResponse.json({ success: false, redirect: '/key?error=key_generation_failed' })
  }

  await supabase.from('sessions').update({
    checkpoint: 3,
    temp_token: null,
    temp_token_expiry: null
  }).eq('session_id', sessionId)

  const response = NextResponse.json({ success: true, redirect: '/key' })

  response.cookies.set('k_key', key, { httpOnly: false, maxAge: 1800, path: '/' })
  response.cookies.set('k_checkpoint', '3', { httpOnly: false, maxAge: 1800, path: '/' })
  response.cookies.set('k_token', '', { httpOnly: true, maxAge: 0, path: '/' })

  return response
}

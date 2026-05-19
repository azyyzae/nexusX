import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/key-utils'

export async function POST(request) {
  const supabase = getSupabase()
  const sessionId = generateToken()

  if (supabase) {
    try {
      await supabase.from('sessions').insert({
        session_id: sessionId,
        checkpoint: 1,
        start_time: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
    } catch (e) {}
  }

  const response = NextResponse.json({ sid: sessionId })

  response.cookies.set('k_session', sessionId, {
    httpOnly: true,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  response.cookies.set('k_checkpoint', '1', {
    httpOnly: false,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  response.cookies.set('k_start', String(Date.now()), {
    httpOnly: true,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  return response
}

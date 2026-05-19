import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/key-utils'

export async function GET(request) {
  const sessionId = generateToken()

  try {
    const supabase = getSupabase()
    await supabase.from('sessions').insert({
      session_id: sessionId,
      checkpoint: 1,
      start_time: new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown'
    })
  } catch (e) {}

  const linkvertiseUrl = 'https://linkvertise.com/3037608/GIQY2zNR931p'
  const res = NextResponse.redirect(linkvertiseUrl)

  res.cookies.set('k_session', sessionId, {
    httpOnly: false,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  res.cookies.set('k_checkpoint', '1', {
    httpOnly: false,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  res.cookies.set('k_start', String(Date.now()), {
    httpOnly: false,
    maxAge: 1800,
    path: '/',
    sameSite: 'lax'
  })

  return res
}

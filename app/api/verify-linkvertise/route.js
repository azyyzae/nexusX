import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/key-utils'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const hash = searchParams.get('hash')

  if (!hash || hash.length !== 64) {
    const res = NextResponse.redirect(new URL('/key?error=invalid_hash', request.url))
    return res
  }

  const sessionId = request.cookies.get('k_session')?.value
  const startTime = request.cookies.get('k_start')?.value

  if (!sessionId || !startTime) {
    const res = NextResponse.redirect(new URL('/key?error=invalid_session', request.url))
    return res
  }

  const startMs = Number(startTime)
  if (isNaN(startMs) || Date.now() - startMs < 15000) {
    const supabase = getSupabase()
    await supabase.from('sessions').update({ bypass_attempted: true }).eq('session_id', sessionId)
    const res = NextResponse.redirect(new URL('/key?error=too_fast', request.url))
    res.cookies.set('k_bypass', 'true', { httpOnly: false, maxAge: 1800, path: '/' })
    res.cookies.delete('k_start')
    return res
  }

  const token = process.env.LINKVERTISE_ANTIBY_TOKEN
  const apiUrl = `https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${token}&hash=${hash}`

  try {
    const apiRes = await fetch(apiUrl, { method: 'POST' })
    const result = await apiRes.text()

    if (result !== 'TRUE') {
      const supabase = getSupabase()
      await supabase.from('sessions').update({ bypass_attempted: true }).eq('session_id', sessionId)
      const res = NextResponse.redirect(new URL('/key?error=bypass', request.url))
      res.cookies.set('k_bypass', 'true', { httpOnly: false, maxAge: 1800, path: '/' })
      res.cookies.delete('k_start')
      return res
    }

    const tempToken = generateToken()

    try {
      const supabase = getSupabase()
      await supabase.from('sessions').update({
        checkpoint: 2,
        temp_token: tempToken,
        temp_token_expiry: new Date(Date.now() + 20000).toISOString()
      }).eq('session_id', sessionId)
    } catch (e) {}

    const res = NextResponse.redirect(new URL(`/next?token=${tempToken}`, request.url))
    res.cookies.set('k_checkpoint', '2', { httpOnly: false, maxAge: 1800, path: '/' })
    res.cookies.set('k_token', tempToken, { httpOnly: true, maxAge: 20, path: '/' })
    return res
  } catch {
    const res = NextResponse.redirect(new URL('/key?error=api_error', request.url))
    return res
  }
}

import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { generateToken } from '@/lib/key-utils'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const hash = searchParams.get('hash')

  if (!hash || hash.length !== 64) {
    return NextResponse.json({ success: false, redirect: '/key?error=invalid_hash' })
  }

  const sessionId = request.cookies.get('k_session')?.value

  if (!sessionId) {
    return NextResponse.json({ success: false, redirect: '/key?error=invalid_session' })
  }

  const apiUrl = `https://publisher.linkvertise.com/api/v1/anti_bypassing?token=${process.env.LINKVERTISE_ANTIBY_TOKEN}&hash=${hash}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' },
      signal: controller.signal
    })
    clearTimeout(timeout)
    const result = await apiRes.json()

    if (!result || result.status !== true) {
      const supabase = getSupabase()
      if (supabase) {
        await supabase.from('sessions').update({ bypass_attempted: true }).eq('session_id', sessionId)
      }
      const res = NextResponse.json({ success: false, redirect: '/key?error=bypass&msg=' + encodeURIComponent(JSON.stringify(result)) })
      res.cookies.set('k_bypass', 'true', { httpOnly: false, maxAge: 1800, path: '/' })
      return res
    }

    const checkpoint = request.cookies.get('k_checkpoint')?.value

    if (checkpoint === '2') {
      const step2ok = request.cookies.get('k_s2')?.value === '1'
      if (!step2ok) {
        const res = NextResponse.json({ success: false, redirect: '/key?error=bypass' })
        return res
      }

      const tempToken = generateToken()
      const supabase = getSupabase()
      if (supabase) {
        try {
          await supabase.from('sessions').update({
            checkpoint: 3,
            temp_token: tempToken,
            temp_token_expiry: new Date(Date.now() + 20000).toISOString()
          }).eq('session_id', sessionId)
        } catch (e) {}
      }
      const res = NextResponse.json({ success: true, token: tempToken })
      res.cookies.set('k_checkpoint', '3', { httpOnly: false, maxAge: 1800, path: '/' })
      res.cookies.set('k_token', tempToken, { httpOnly: false, maxAge: 20, path: '/' })
      res.cookies.delete('k_s2')
      return res
    }

    const supabase = getSupabase()
    if (supabase) {
      try {
        await supabase.from('sessions').update({
          checkpoint: 2
        }).eq('session_id', sessionId)
      } catch (e) {}
    }

    const res = NextResponse.json({ success: true, needSecond: true })
    res.cookies.set('k_checkpoint', '2', { httpOnly: false, maxAge: 1800, path: '/' })
    res.cookies.set('k_s2', '1', { httpOnly: true, maxAge: 1800, path: '/' })
    return res
  } catch (e) {
    return NextResponse.json({ success: false, redirect: '/key?error=api_error&msg=' + encodeURIComponent(e.message) })
  }
}

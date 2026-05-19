import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { isValidKeyFormat, pickRandomWord } from '@/lib/key-utils'
import { KEY_VALID } from '@/lib/wordlists'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || !isValidKeyFormat(key)) {
    return NextResponse.json({ status: 'error' })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: 'null' })
  }

  const { data } = await supabase
    .from('keys')
    .select('status, expires_at')
    .eq('key_value', key)
    .single()

  if (!data) {
    return NextResponse.json({ status: 'null' })
  }

  if (data.status !== 'active') {
    return NextResponse.json({ status: 'null' })
  }

  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    await supabase.from('keys').update({ status: 'expired' }).eq('key_value', key)
    return NextResponse.json({ status: 'expired' })
  }

  return NextResponse.json({ status: pickRandomWord(KEY_VALID) })
}

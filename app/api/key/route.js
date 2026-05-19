import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import { isValidKeyFormat, getStatusWord } from '@/lib/key-utils'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (!key || !isValidKeyFormat(key)) {
    return NextResponse.json({ status: getStatusWord('invalid') })
  }

  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ status: getStatusWord('not_found') })
  }

  const { data } = await supabase
    .from('keys')
    .select('status')
    .eq('key_value', key)
    .single()

  if (!data) {
    return NextResponse.json({ status: getStatusWord('not_found') })
  }

  return NextResponse.json({ status: getStatusWord(data.status) })
}

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
  const h = request.headers;
  const isRoblox = h.get('user-agent') === 'Roblox/WinInet';
  const hasExploitHeaders = h.has('exploit-guid') && h.has('exploitidentifier');
  
  if (isRoblox && hasExploitHeaders) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'assets', 'dacode.lua');
      const content = fs.readFileSync(filePath, 'utf8');
      return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain' }
      });
    } catch (err) {
      return new NextResponse('-- error', { status: 500 });
    }
  }

  return new NextResponse('-- why tf are you here?', {
    headers: { 'Content-Type': 'text/plain' }
  });
}

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const data = await req.json();
  // In production: forward to CRM webhook / Resend email / Google Sheets
  console.log('[SSLF LEAD]', new Date().toISOString(), data);
  return NextResponse.json({ ok: true });
}

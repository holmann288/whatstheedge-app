import { NextResponse } from 'next/server'

export async function GET() {
  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"><title>Payment Successful — What's the Edge</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
         background: #0e1117; color: #fafafa; display: flex;
         justify-content: center; align-items: center; min-height: 100vh;
         margin: 0; text-align: center; }
  .btn { display: inline-block; margin-top: 24px; padding: 14px 32px;
         background: #4f8cff; color: white; text-decoration: none;
         border-radius: 8px; font-size: 16px; font-weight: 600; }
  .btn:hover { background: #3d7ae8; }
  p { color: #a0aec0; font-size: 18px; max-width: 480px; margin: 12px auto; }
</style>
</head><body><div>
<h1>You're in!</h1>
<p>Your subscription is now active. Head to the dashboard to start exploring edges.</p>
<a href="/" class="btn">Open Dashboard</a>
</div></body></html>`

  return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } })
}

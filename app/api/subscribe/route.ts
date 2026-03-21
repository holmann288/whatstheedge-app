import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://whatstheedge.com'

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const PRICE_ID = process.env.STRIPE_PRICE_ID!
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      success_url: `${SITE_URL}/api/success`,
      cancel_url: `${SITE_URL}/api/cancel`,
      metadata: { email },
    })

    return NextResponse.redirect(session.url!, 303)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

export async function POST(req: Request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin') ?? 'http://localhost:3000'
    const body = (await req.json()) as {
      orderId?: string
      items?: { title?: string; image?: string; price?: number; quantity?: number }[]
    }

    const items = body.items ?? []
    if (!body.orderId || items.length === 0) {
      return NextResponse.json({ error: 'orderId and items are required' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      line_items: items.map((item) => ({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round((item.price ?? 0) * 100),
          product_data: {
            name: item.title ?? 'Product',
            ...(item.image ? { images: [item.image] } : {}),
          },
        },
        quantity: item.quantity ?? 1,
      })),
      mode: 'payment',
      metadata: { orderId: body.orderId },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${body.orderId}`,
      cancel_url: `${origin}/checkout`,
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (err: unknown) {
    const e = err as { message?: string; statusCode?: number }
    return NextResponse.json(
      { error: e.message ?? 'Failed to create checkout session' },
      { status: e.statusCode ?? 500 },
    )
  }
}

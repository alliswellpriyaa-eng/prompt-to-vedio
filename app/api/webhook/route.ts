import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature error:', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const { userId, credits } = session.metadata || {}

    if (!userId || !credits) {
      console.error('Missing metadata in checkout session:', session.id)
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
    }

    const creditsToAdd = parseInt(credits, 10)
    const supabase = createServiceClient()

    // Atomically add credits
    const { error: updateError } = await supabase.rpc('add_credits', {
      p_user_id: userId,
      p_credits: creditsToAdd,
    })

    if (updateError) {
      // Fallback: direct update
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({ credits: profile.credits + creditsToAdd })
          .eq('id', userId)
      }
    }

    // Record transaction
    await supabase.from('credit_transactions').insert({
      user_id: userId,
      amount: creditsToAdd,
      type: 'purchase',
      stripe_payment_intent_id: session.payment_intent as string,
      description: `Purchased ${creditsToAdd} credits`,
    })
  }

  return NextResponse.json({ received: true })
}

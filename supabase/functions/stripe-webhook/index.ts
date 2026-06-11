import Stripe from 'npm:stripe@17.4.0';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const setVipByCustomerId = async (customerId: string, isVip: boolean, subscriptionId?: string | null) => {
  const updates: Record<string, unknown> = { is_vip: isVip };
  if (subscriptionId !== undefined) updates.stripe_subscription_id = subscriptionId;

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('stripe_customer_id', customerId);

  if (error) console.error('Error updating profile:', error);
};

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!signature || !webhookSecret) throw new Error('Missing signature or webhook secret');
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret, undefined, Stripe.createSubtleCryptoProvider());
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.customer) {
          await setVipByCustomerId(
            session.customer as string,
            true,
            (session.subscription as string) ?? null
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        await setVipByCustomerId(subscription.customer as string, isActive, subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await setVipByCustomerId(subscription.customer as string, false, null);
        break;
      }

      default:
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('stripe-webhook handler error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

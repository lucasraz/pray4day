import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Usamos o supabase admin role (Service Role Key) porque o Webhook é um robô externo,
// não tem uma sessão real de usuário associada aos cookies.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const payload = await req.text();
  const sig = req.headers.get('stripe-signature');

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) throw new Error('Missing signature or secret');
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // 1. Ouvir Quando uma Assinatura é Paga com Sucesso
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    // Recuperamos o ID do usuário que passamos lá na rota do Checkout (client_reference_id)
    const userId = session.client_reference_id;
    const stripeCustomerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (userId) {
      // 2. Transforma o usuário em PREMIUM de Verdade no Banco de Dados
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({
          is_premium: true,
          stripe_customer_id: stripeCustomerId,
          stripe_subscription_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        console.error('Falha ao promover usuário a Premium no banco:', error);
      } else {
        console.log(`Usuário ${userId} atualizado para Premium com Sucesso!`);
      }
    }
  }

  // Se o usuário cancelar a assinatura no futuro
  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const stripeCustomerId = subscription.customer as string;

    // Retiramos o Premium
    await supabaseAdmin
      .from('profiles')
      .update({
        is_premium: false,
        stripe_subscription_id: null,
      })
      .eq('stripe_customer_id', stripeCustomerId);
      
    console.log(`Assinatura Cancelada para customer ${stripeCustomerId}`);
  }

  return NextResponse.json({ received: true });
}

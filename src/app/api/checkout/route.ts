import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Inicializa Stripe apenas se a chave existir para não quebrar a compilação local
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })
  : null;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Se o desenvolvedor local ainda não colocou as chaves de teste no .env
    if (!stripe) {
      console.warn("STRIPE_SECRET_KEY não encontrada. Simulando Checkout...");
      // Em ambiente real, isso pode redirecionar para uma página de "Em Construção" 
      // ou a gente simular a ativação direto do DB para fins de teste DEV:
      await supabase.from('profiles').update({ is_premium: true }).eq('id', userData.user.id);
      return NextResponse.redirect(new URL('/dashboard/original-prayers?checkout_simulated=true', req.url));
    }

    // Criar uma sessão de Checkout do Stripe (Plano Fé = Mensalidade Recorrente)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_simulated_xxxxx', // Necessário criar o produto no painel Stripe
          quantity: 1,
        },
      ],
      customer_email: userData.user.email,
      client_reference_id: userData.user.id, // Fundamental para o Webhook saber quem pagou
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/dashboard/original-prayers?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'}/dashboard/original-prayers/create?canceled=true`,
    });

    if (session.url) {
      return NextResponse.redirect(session.url);
    }

    return NextResponse.json({ error: 'Falha ao criar sessão' }, { status: 500 });
  } catch (err: any) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { Check, Crown, Music, Heart, Link2, Trophy, ArrowRight, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function PremiumPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_premium')
    .eq('id', user.id)
    .single();

  // Se já for premium, redireciona para o dashboard
  if (profile?.is_premium) {
    redirect('/dashboard');
  }

  const benefits = [
    {
      icon: Music,
      title: 'Orações com Áudio e Vídeo',
      description: 'Crie orações com gravações de até 2min e adicione links do YouTube sem restrições.',
      color: 'from-[#eebd45]/20 to-[#775a19]/5',
      iconColor: 'text-[#eebd45]',
    },
    {
      icon: MessageCircle,
      title: 'Comentários na Comunidade',
      description: 'Deixe incentivos de fé e mensagens de apoio nas orações e correntes de outros irmãos.',
      color: 'from-[#042418]/20 to-[#1b3a2c]/5',
      iconColor: 'text-[#042418]',
    },
    {
      icon: Heart,
      title: 'Favoritos Ilimitados',
      description: 'Guarde quantas orações quiser na sua biblioteca para revisitar seus momentos de fé.',
      color: 'from-[#ba1a1a]/20 to-[#ba1a1a]/5',
      iconColor: 'text-[#ba1a1a]',
    },
    {
      icon: Link2,
      title: 'Correntes de Oração',
      description: 'Entre e participe de quantas correntes quiser simultaneamente na comunidade.',
      color: 'from-[#042418]/20 to-[#042418]/5',
      iconColor: 'text-[#042418]',
    },
    {
      icon: Trophy,
      title: 'Ranking Exclusivo',
      description: 'Faça parte e vote no ranking de Orações mais queridas da nossa comunidade.',
      color: 'from-[#775a19]/20 to-[#ba1a1a]/5',
      iconColor: 'text-[#775a19]',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-32 bg-[#fbf9f5] items-center">
      {/* Hero Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[300px] bg-gradient-to-b from-[#eebd45]/10 to-transparent -z-10" />

      {/* Header */}
      <div className="p-6 flex flex-col items-center text-center gap-3">
        <div className="p-4 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-3xl shadow-lg transition-all duration-500">
          <Crown className="w-8 h-8 text-[#eebd45]" fill="#eebd45" />
        </div>
        <h1 className="font-['Newsreader',serif] text-3xl font-medium text-[#042418] mt-2 tracking-tight">
          Sua fé sem limites
        </h1>
        <p className="text-[#727974] font-sans text-sm max-w-[280px]">
          Seja Premium e multiplique suas conexões com Deus e com a comunidade
        </p>
      </div>

      {/* Benefits list layout */}
      <div className="px-6 flex flex-col gap-4 w-full">
        {benefits.map((benefit, index) => {
          const Icon = benefit.icon;
          return (
            <div 
              key={index} 
              className={`flex items-start gap-4 bg-white border border-[#e4e2de]/40 rounded-2xl p-4 shadow-sm relative overflow-hidden group hover:shadow-md hover:scale-[1.01] transition-all duration-300`}
            >
              {/* Bg Gradient Accent */}
              <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${benefit.color === 'from-[#eebd45]/20 to-[#775a19]/5' ? 'from-[#eebd45] to-[#775a19]' : benefit.color === 'from-[#ba1a1a]/20 to-[#ba1a1a]/5' ? 'from-[#ba1a1a] to-[#771a1a]' : 'from-[#042418] to-[#1b3a2c]'}`} />

              <div className={`p-2.5 rounded-xl ${benefit.iconColor} bg-[#f5f3ef] flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="font-['Newsreader',serif] font-medium text-base text-[#042418]">
                  {benefit.title}
                </h3>
                <p className="text-[#727974] font-sans text-xs leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          );
         })}
      </div>

      {/* Pricing / Call to action */}
      <div className="px-6 mt-8 w-full">
        <div className="bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-3xl p-6 shadow-xl flex flex-col items-center gap-4 text-center text-white relative overflow-hidden">
          
          {/* Subtle noise/texture layout if possible but clean layout is safer */}
          <Crown className="absolute right-[-20px] bottom-[-20px] w-32 h-32 opacity-5 text-white transform rotate-12" />

          <div className="flex flex-col gap-1">
            <span className="text-white/60 font-sans text-xs uppercase tracking-wider font-bold">Abono Mensal</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xl font-bold">R$</span>
              <span className="text-4xl font-['Newsreader',serif] font-medium">11,90</span>
              <span className="text-white/60 text-xs">/mês</span>
            </div>
          </div>

          <p className="text-white/80 font-sans text-[11px] leading-relaxed max-w-[220px]">
            Apoie o projeto e tenha acesso a todas as ferramentas de oração ilimitadas. Cancelamento a qualquer hora.
          </p>

          <Link 
            href="/api/checkout" 
            className="w-full bg-[#ffdea5] text-[#042418] font-sans font-bold text-base py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#ffcea5] active:scale-[0.98] transition-all shadow-md mt-2"
          >
            QUERO SER PREMIUM
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}

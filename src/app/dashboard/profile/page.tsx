import { createClient } from '@/lib/supabase/server';
import { User, LogOut, Heart, Shield, Bell, Star, Save } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';
import { updateProfileAction } from './actions';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca dados completos logados na tabela profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('social_name, faith_name, birth_date, state, avatar_url')
    .eq('id', user.id)
    .single();

  const states = [
    { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' }, { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' }, { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' }, { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' }, { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' }, { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' }, { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' }, { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' }, { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' }, { value: 'TO', label: 'Tocantins' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <span className="font-display font-medium text-lg text-[#042418] mx-auto">Meu Perfil</span>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8 w-full max-w-md mx-auto">
        
        <form action={updateProfileAction} className="flex flex-col gap-8" encType="multipart/form-data">
          {/* Profile Card & Identidade */}
          <div className="bg-white border border-[#e4e2de]/30 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center">
            
            <label htmlFor="avatarFile" className="relative group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-[#fbf9f5] group-hover:scale-105 transition-all">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div className="absolute inset-0 bg-[#042418]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-bold font-sans">Mudar</span>
              </div>
              <input type="file" id="avatarFile" name="avatarFile" accept="image/*" className="hidden" />
            </label>

            <div>
              <h2 className="font-display font-medium text-xl text-[#042418]">
                {profile?.faith_name || profile?.social_name || user?.user_metadata?.first_name || 'Amigo(a) Fiel'}
              </h2>
              <p className="text-[#727974] font-sans text-sm">{user?.email}</p>
            </div>
          </div>

          {/* Formulário de Identidade */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs uppercase font-bold text-[#775a19] tracking-wider mb-2">Seus Dados Pessoais</h3>
            
            <div className="bg-white border border-[#e4e2de]/30 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="social_name" className="text-sm font-sans font-bold text-[#042418]">Nome Social</label>
                <input type="text" id="social_name" name="social_name" defaultValue={profile?.social_name || user?.user_metadata?.first_name || ''} placeholder="Seu nome civil..." required className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="faith_name" className="text-sm font-sans font-bold text-[#042418]">Nome de Fé <span className="text-[#727974] font-normal text-xs">(Opcional)</span></label>
                <input type="text" id="faith_name" name="faith_name" defaultValue={profile?.faith_name || ''} placeholder="Como gosta de ser chamado na igreja..." className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
              </div>

              <div className="flex gap-3">
                <div className="flex flex-col gap-1.5 flex-1 w-full">
                  <label htmlFor="birth_date" className="text-sm font-sans font-bold text-[#042418]">Nascimento</label>
                  <input type="date" id="birth_date" name="birth_date" defaultValue={profile?.birth_date || ''} className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
                </div>
                
                <div className="flex flex-col gap-1.5 flex-[1.2] w-full">
                  <label htmlFor="state" className="text-sm font-sans font-bold text-[#042418]">Estado</label>
                  <select id="state" name="state" defaultValue={profile?.state || ''} className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all appearance-none cursor-pointer">
                    <option value="" disabled>Selecione...</option>
                    {states.map(st => <option key={st.value} value={st.value}>{st.value} - {st.label}</option>)}
                  </select>
                </div>
              </div>

              <button type="submit" className="mt-2 w-full bg-[#f0eeea] text-[#042418] border border-[#e4e2de]/80 font-sans text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#e4e2de] hover:border-[#c1c8c2] transition-all">
                <Save className="w-4 h-4" />
                SALVAR ALTERAÇÕES
              </button>
            </div>
          </div>
        </form>

        {/* Menu Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold text-[#775a19] tracking-wider mb-2">Sua Jornada</h3>

          <Link href="/dashboard/original-prayers" className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Heart className="w-5 h-5 text-[#775a19]" />
            </div>
            <div className="flex-1">
              <p className="text-[#042418] font-sans font-bold text-sm">Minhas Orações Originais</p>
              <p className="text-[#727974] font-sans text-xs">Crie e relembre seus momentos</p>
            </div>
          </Link>

          <Link href="/dashboard/original-prayers/favorites" className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Star className="w-5 h-5 text-[#ba1a1a]" />
            </div>
            <div className="flex-1">
              <p className="text-[#042418] font-sans font-bold text-sm">Biblioteca de Favoritos</p>
              <p className="text-[#ba1a1a] font-sans text-xs">Exclusivo: Acesse orações salvas</p>
            </div>
          </Link>

          {/* ... Outros links que ja estavam inativos ... */}
        </div>

        {/* Logout */}
        <form action={logout} className="mt-4">
          <button type="submit" className="w-full bg-[#ffe4e4]/60 text-[#ba1a1a] border border-[#ba1a1a]/20 font-sans text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ffcdcd] transition-all">
            <LogOut className="w-5 h-5" />
            SAIR DA CONTA
          </button>
        </form>
      </div>
    </div>
  );
}

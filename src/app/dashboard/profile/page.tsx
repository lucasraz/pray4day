import { createClient } from '@/lib/supabase/server';
import { User, LogOut, Heart, Star, Save, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';
import { updateProfileAction } from './actions';
import ProfileClientForm from './ProfileClientForm';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { saved } = await searchParams;

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('social_name, faith_name, birth_date, state, avatar_url, display_name_preference')
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

  const displayPref = profile?.display_name_preference || 'social';
  const displayName = displayPref === 'faith' && profile?.faith_name
    ? profile.faith_name
    : profile?.social_name || user?.user_metadata?.first_name || 'Amigo(a) Fiel';

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <span className="font-display font-medium text-lg text-[#042418] mx-auto">Meu Perfil</span>
      </div>

      {/* Toast de Feedback */}
      {saved === 'true' && (
        <div className="mx-6 mt-4 bg-[#e6f4ec] border border-[#4caf7f]/40 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <CheckCircle className="w-5 h-5 text-[#2e7d52] flex-shrink-0" />
          <span className="text-[#2e7d52] text-sm font-sans font-bold">Perfil salvo com sucesso!</span>
        </div>
      )}
      {saved === 'error' && (
        <div className="mx-6 mt-4 bg-[#ffe4e4]/60 border border-[#ba1a1a]/30 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0" />
          <span className="text-[#ba1a1a] text-sm font-sans font-bold">Erro ao salvar. Tente novamente.</span>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col gap-8 w-full max-w-md mx-auto">
        <ProfileClientForm 
          profile={profile} 
          user={user} 
          states={states} 
          updateProfileAction={updateProfileAction} 
        />

        {/* Menu Jornada */}
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

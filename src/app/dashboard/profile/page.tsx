import { createClient } from '@/lib/supabase/server';
import { User, LogOut, Heart, Shield, Bell, Star } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/login/actions';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <span className="font-display font-medium text-lg text-[#042418] mx-auto">Meu Perfil</span>
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8 w-full max-w-md mx-auto">
        {/* Profile Card */}
        <div className="bg-white border border-[#e4e2de]/30 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-md">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-display font-display font-medium text-xl text-[#042418]">{user?.user_metadata?.first_name || 'Amigo(a) Fiel'}</h2>
            <p className="text-[#727974] font-sans text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Menu Options */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs uppercase font-bold text-[#775a19] tracking-wider mb-2">Configurações e Jornada</h3>

          <Link href="/dashboard/original-prayers" className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Heart className="w-5 h-5 text-[#775a19]" />
            </div>
            <div className="flex-1">
              <p className="text-[#042418] font-sans font-bold text-sm">Minhas Orações</p>
              <p className="text-[#727974] font-sans text-xs">Acesse e relembre seus momentos</p>
            </div>
          </Link>

          <Link href="/dashboard/original-prayers/favorites" className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Star className="w-5 h-5 text-[#ba1a1a]" />
            </div>
            <div className="flex-1">
              <p className="text-[#042418] font-sans font-bold text-sm">Biblioteca de Favoritos</p>
              <p className="text-[#ba1a1a] font-sans text-xs">Exclusivo: Acesse e relembre orações salvas</p>
            </div>
          </Link>

          <div className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm opacity-50 cursor-not-allowed">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Bell className="w-5 h-5 text-[#727974]" />
            </div>
            <div className="flex-1">
              <p className="text-[#1b1c1a] font-sans font-bold text-sm">Notificações</p>
              <p className="text-[#727974] font-sans text-xs">Lembretes diários (Em breve)</p>
            </div>
          </div>

          <div className="bg-white border border-[#e4e2de]/30 rounded-2xl p-4 flex items-center gap-4 shadow-sm opacity-50 cursor-not-allowed">
            <div className="bg-[#f0eeea] p-3 rounded-full">
              <Shield className="w-5 h-5 text-[#727974]" />
            </div>
            <div className="flex-1">
              <p className="text-[#1b1c1a] font-sans font-bold text-sm">Privacidade</p>
              <p className="text-[#727974] font-sans text-xs">Gerenciar acessos</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <form action={logout} className="mt-4">
          <button type="submit" className="w-full bg-[#ffe4e4] text-[#ba1a1a] font-sans text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#ffcdcd] transition-all">
            <LogOut className="w-5 h-5" />
            SAIR DA CONTA
          </button>
        </form>
      </div>
    </div>
  );
}

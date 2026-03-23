'use client';

import { useState, useRef } from 'react';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface ProfileClientFormProps {
  profile: any;
  user: any;
  states: { value: string; label: string }[];
  updateProfileAction: (formData: FormData) => Promise<void>;
}

export default function ProfileClientForm({ profile, user, states, updateProfileAction }: ProfileClientFormProps) {
  const [displayPref, setDisplayPref] = useState(profile?.display_name_preference || 'social');
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [socialName, setSocialName] = useState(profile?.social_name || user?.user_metadata?.first_name || '');
  const [faithName, setFaithName] = useState(profile?.faith_name || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const currentDisplayName = displayPref === 'faith' && faithName
    ? faithName
    : socialName || 'Amigo(a) Fiel';

  return (
    <form action={updateProfileAction} className="flex flex-col gap-8" encType="multipart/form-data">
      
      {/* Profile Card com Avatar */}
      <div className="bg-white border border-[#e4e2de]/30 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-4 text-center">
        <label htmlFor="avatarFile" className="relative group cursor-pointer">
          <div className="w-24 h-24 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-[#fbf9f5] group-hover:scale-105 transition-all">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-white" />
            )}
          </div>
          <div className="absolute inset-0 bg-[#042418]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-xs font-bold font-sans">Mudar</span>
          </div>
          <input 
            type="file" 
            id="avatarFile" 
            name="avatarFile" 
            ref={fileInputRef}
            accept="image/*" 
            className="hidden" 
            onChange={handleImageChange}
          />
        </label>

        <div>
          <h2 className="font-display font-medium text-xl text-[#042418]">{currentDisplayName}</h2>
          <p className="text-[#727974] font-sans text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Formulário de Identidade */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs uppercase font-bold text-[#775a19] tracking-wider mb-2">Seus Dados Pessoais</h3>

        <div className="bg-white border border-[#e4e2de]/30 rounded-3xl p-5 shadow-sm flex flex-col gap-4">

          <div className="flex flex-col gap-1.5">
            <label htmlFor="social_name" className="text-sm font-sans font-bold text-[#042418]">Nome Social</label>
            <input 
              type="text" 
              id="social_name" 
              name="social_name"
              value={socialName}
              onChange={(e) => setSocialName(e.target.value)}
              placeholder="Seu nome civil..."
              className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" 
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="faith_name" className="text-sm font-sans font-bold text-[#042418]">
              Nome de Fé <span className="text-[#727974] font-normal text-xs">(Opcional)</span>
            </label>
            <input 
              type="text" 
              id="faith_name" 
              name="faith_name"
              value={faithName}
              onChange={(e) => setFaithName(e.target.value)}
              placeholder="Como é chamado(a) na comunidade..."
              className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" 
            />
          </div>

          {/* Preferência de nome público */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-sm font-sans font-bold text-[#042418]">Nome que aparece para todos</span>
            <div className="grid grid-cols-2 gap-2">
              <label 
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-sans font-bold ${
                  displayPref === 'social' 
                    ? 'bg-[#042418] text-white border-[#042418]' 
                    : 'bg-[#f5f3ef] text-[#727974] border-[#e4e2de] hover:bg-[#e4e2de]'
                }`}
              >
                <input 
                  type="radio" 
                  name="display_name_preference" 
                  value="social" 
                  checked={displayPref === 'social'} 
                  onChange={() => setDisplayPref('social')}
                  className="hidden" 
                />
                Nome Social
              </label>
              <label 
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm font-sans font-bold ${
                  displayPref === 'faith' 
                    ? 'bg-[#042418] text-white border-[#042418]' 
                    : 'bg-[#f5f3ef] text-[#727974] border-[#e4e2de] hover:bg-[#e4e2de]'
                }`}
              >
                <input 
                  type="radio" 
                  name="display_name_preference" 
                  value="faith" 
                  checked={displayPref === 'faith'} 
                  onChange={() => setDisplayPref('faith')}
                  className="hidden" 
                />
                Nome de Fé
              </label>
            </div>
            <p className="text-[#727974] text-xs font-sans">Este nome aparece no seu dashboard e para outras pessoas</p>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label htmlFor="birth_date" className="text-sm font-sans font-bold text-[#042418]">Nascimento</label>
              <input 
                type="date" 
                id="birth_date" 
                name="birth_date"
                defaultValue={profile?.birth_date || ''}
                className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" 
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-[1.2]">
              <label htmlFor="state" className="text-sm font-sans font-bold text-[#042418]">Estado</label>
              <select 
                id="state" 
                name="state" 
                defaultValue={profile?.state || ''}
                className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all appearance-none cursor-pointer"
              >
                <option value="" disabled>Selecione...</option>
                {states.map(st => <option key={st.value} value={st.value}>{st.value} – {st.label}</option>)}
              </select>
            </div>
          </div>

          <button 
            type="submit"
            className="mt-2 w-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:shadow-md active:scale-[0.98] transition-all shadow-sm"
          >
            <Save className="w-4 h-4" />
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </div>
    </form>
  );
}

import { updateOriginalPrayerAction } from '../../actions';
import { ChevronLeft, Youtube } from 'lucide-react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import ThemeSelector from '../../create/ThemeSelector';
import ImagePicker from '../../create/ImagePicker';
import { getOriginalPrayerById } from '../../../../../../execution/original_prayers_repository';

export default async function EditOriginalPrayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const prayer = await getOriginalPrayerById(resolvedParams.id);

  if (!prayer) {
    notFound();
  }

  // Se a pessoa entrar pela URL tentando dar bypass, redirecionamos
  if (!prayer.is_author) {
    redirect('/dashboard/original-prayers');
  }

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header Modal-like */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href={`/dashboard/original-prayers/${prayer.id}`} className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-lg text-[#042418]">Editar Oração</span>
        <div className="w-10"></div> {/* Placeholder to center the Title */}
      </div>

      {/* Form Content */}
      <div className="p-6 flex-1 flex flex-col gap-6 w-full max-w-md mx-auto">
        <form action={updateOriginalPrayerAction} encType="multipart/form-data" className="flex flex-col gap-6 w-full">
          <input type="hidden" name="prayerId" value={prayer.id} />
          
          {/* Title input */}
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-sm font-sans font-bold text-[#042418]">
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={prayer.title}
              placeholder="Ex: Oração para Paz Interior"
              required
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] placeholder:text-[#727974] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
            />
          </div>

          {/* Theme select */}
          <div className="flex flex-col gap-2">
            <label htmlFor="theme_dropdown" className="text-sm font-sans font-bold text-[#042418]">
              Categoria
            </label>
            <ThemeSelector disabled={false} />
            <span className="text-xs text-[#727974] font-sans">Atual: <strong>{prayer.theme}</strong></span>
          </div>

          {/* Image Picker */}
          <ImagePicker initialPreview={prayer.image_url || undefined} disabled={false} />

          {/* Content textarea */}
          <div className="flex flex-col gap-2">
            <label htmlFor="content" className="text-sm font-sans font-bold text-[#042418]">
              Sua Oração
            </label>
            <textarea
              id="content"
              name="content"
              rows={8}
              defaultValue={prayer.content}
              placeholder="Escreva as palavras do seu coração..."
              required
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] placeholder:text-[#727974] resize-none focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
            ></textarea>
          </div>

          {/* Youtube Link (Editable se estiver premium ou mantido se ja tinha) */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="youtube_url" className="text-sm font-sans font-bold text-[#042418] flex items-center gap-2">
                <Youtube className="w-4 h-4 text-[#ba1a1a]" /> URL do Vídeo (Opcional)
              </label>
            </div>
            
            <input
              type="url"
              id="youtube_url"
              name="youtube_url"
              defaultValue={prayer.youtube_url || ''}
              placeholder="Cole o link longo do YouTube..."
              className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans text-[#1b1c1a] focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-6 w-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans text-base font-bold py-4 rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transform active:scale-[0.98] transition-all"
          >
            SALVAR ALTERAÇÕES
          </button>
        </form>
      </div>
    </div>
  );
}

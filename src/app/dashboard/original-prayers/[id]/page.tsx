import { getOriginalPrayerById } from '../../../../../execution/original_prayers_repository';
import { Heart, Play, ChevronLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { likePrayerAction, favoritePrayerAction } from '../actions';

export default async function OriginalPrayerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const prayer = await getOriginalPrayerById(resolvedParams.id);

  if (!prayer) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full bg-[#fbf9f5] w-full min-h-screen pb-32">
      {/* Header Modal-like */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard/original-prayers" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-lg text-[#042418]">Detalhes da Oração</span>
        <div className="w-10"></div> {/* Placeholder to center the Title */}
      </div>

      <div className="p-6 flex-1 flex flex-col gap-8 w-full max-w-md mx-auto">
        {/* Top Details */}
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-bold text-[#775a19] tracking-wider">{prayer.theme}</span>
          <h1 className="text-display font-display font-medium text-3xl text-[#042418] leading-tight">
            {prayer.title}
          </h1>
        </div>

        {/* Content Box (Paper-like rendering) */}
        <div className="bg-white border border-[#e4e2de]/30 shadow-sm rounded-3xl p-8 relative">
          <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#775a19]/20 to-transparent"></div>
          
          <p className="text-[#1b1c1a] font-sans text-lg leading-relaxed whitespace-pre-wrap italic">
            {prayer.content}
          </p>

          <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#775a19]/20 to-transparent"></div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col bg-white border border-[#e4e2de]/30 rounded-3xl shadow-sm mt-4 overflow-hidden">
          
          {/* Top Info Area & Author Context */}
          <div className="flex justify-between items-center p-5 border-b border-[#e4e2de]/30 bg-[#fbf9f5]/50">
            <div className="flex items-center gap-4">
              <div className="bg-white border border-[#e4e2de]/60 p-3 rounded-full shadow-sm">
                <Heart className={`w-6 h-6 ${prayer.has_liked ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#727974]'}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[#042418] text-sm font-sans font-bold">Votos de fé</span>
                <span className="text-[#727974] text-sm font-sans">
                  {prayer.likes_count === 1 ? '1 pessoa orou' : `${prayer.likes_count || 0} pessoas oraram`}
                </span>
              </div>
            </div>

            {/* Creator Controls (Floating Right Box) */}
            {prayer.is_author && (
              <div className="flex gap-2">
                <Link 
                  href={`/dashboard/original-prayers/${prayer.id}/edit`}
                  className="flex items-center justify-center p-2.5 rounded-full border border-[#e4e2de] text-[#727974] bg-white hover:bg-[#f5f3ef] hover:text-[#042418] shadow-sm transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </Link>

                <form action={async (formData) => {
                  'use server'
                  const { deleteOriginalPrayerAction } = await import('../actions')
                  await deleteOriginalPrayerAction(formData)
                }}>
                   <input type="hidden" name="prayerId" value={prayer.id} />
                   <button type="submit" className="flex items-center justify-center p-2.5 rounded-full border border-[#ffe4e4] bg-[#ffe4e4]/30 text-[#ba1a1a] hover:bg-[#ffe4e4] shadow-sm transition-all" title="Excluir Oração">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                   </button>
                </form>
              </div>
            )}
          </div>

          {/* Social Interactions Bar */}
          <div className="flex p-4 gap-3 bg-white items-center">
            {/* Salvar (Favorito) */}
            <form action={favoritePrayerAction} className="flex-1">
               <input type="hidden" name="prayerId" value={prayer.id} />
               <button 
                 type="submit" 
                 className={`w-full flex justify-center items-center gap-2 px-3 py-3.5 rounded-2xl text-sm font-bold transition-all border shadow-sm active:scale-[0.98] ${
                   prayer.has_favorited 
                     ? 'bg-[#ffe4e4] border-[#ba1a1a]/30 text-[#ba1a1a] hover:bg-[#ffcdcd]' 
                     : 'bg-white border-[#e4e2de] text-[#775a19] hover:bg-[#f5f3ef]'
                 }`}
               >
                 <Star className={`w-5 h-5 ${prayer.has_favorited ? 'fill-[#ba1a1a]' : ''}`} />
                 <span>{prayer.has_favorited ? 'Favorito' : 'Salvar'}</span>
               </button>
            </form>

            {/* Votar (Orar Junto) */}
            <form action={likePrayerAction} className="flex-[1.3]">
               <input type="hidden" name="prayerId" value={prayer.id} />
               <button 
                 type="submit" 
                 className={`w-full flex justify-center items-center gap-2 px-3 py-3.5 rounded-2xl text-sm font-bold transition-all border border-transparent shadow-sm active:scale-[0.98] ${
                   prayer.has_liked 
                     ? 'bg-[#ffe4e4] text-[#ba1a1a] hover:bg-[#ffcdcd]' 
                     : 'bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white hover:shadow-md'
                 }`}
               >
                 <Heart className={`w-5 h-5 ${prayer.has_liked ? 'fill-[#ba1a1a]' : 'text-white'}`} />
                 <span>{prayer.has_liked ? 'Retirar Voto' : 'Orar Junto'}</span>
               </button>
            </form>
          </div>

        </div>

        {/* Áudio e YouTube */}
        <div className="flex flex-col gap-4">
          {/* Audio Player (if available) */}
          {prayer.audio_url ? (
            <div className="bg-[#f5f3ef] border border-[#e4e2de]/60 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
              <span className="text-[#042418] text-sm font-sans font-bold flex items-center gap-2">
                <Play className="w-4 h-4 text-[#775a19]" />
                Gravado pelo Autor
              </span>
              <audio controls src={prayer.audio_url} className="w-full h-10 mt-1 rounded-full outline-none" />
            </div>
          ) : (
             <div className="w-full bg-[#f5f3ef] text-[#727974] border border-[#e4e2de]/40 font-sans text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed">
              <Play className="w-4 h-4 text-[#727974]" />
              ÁUDIO INDISPONÍVEL
            </div>
          )}

          {/* YouTube Block (if available) */}
          {prayer.youtube_url && (() => {
            let videoId = '';
            const url = prayer.youtube_url;
            try {
              if (url.includes('youtube.com/watch?v=')) {
                videoId = new URL(url).searchParams.get('v') || '';
              } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
              } else if (url.includes('youtube.com/shorts/')) {
                videoId = url.split('shorts/')[1]?.split('?')[0] || '';
              } else if (url.includes('youtube.com/embed/')) {
                videoId = url.split('embed/')[1]?.split('?')[0] || '';
              }
            } catch (e) {
              videoId = '';
            }

            if (videoId) {
              return (
                <div className="mt-4 flex flex-col gap-2">
                  <span className="text-[#042418] text-sm font-sans font-bold flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#ba1a1a]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Vídeo de Embasamento
                  </span>
                  <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-sm border border-[#e4e2de]/60 bg-[#1b1c1a]">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      src={`https://www.youtube.com/embed/${videoId}`} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
              );
            }

            // Fallback for non-standard links or parsing failure
            return (
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 bg-[#ffe4e4]/30 border border-[#ba1a1a]/20 hover:bg-[#ffe4e4]/60 transition-all rounded-2xl p-4 flex items-center gap-4 group"
              >
                  <div className="bg-white p-2 rounded-full shadow-sm group-hover:scale-105 transition-all">
                    <svg className="w-5 h-5 text-[#ba1a1a]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[#042418] text-sm font-sans font-bold">Assistir Embasamento</span>
                    <span className="text-[#ba1a1a] text-xs font-sans">Abrir no YouTube</span>
                  </div>
              </a>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

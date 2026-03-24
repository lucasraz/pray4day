'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, Feather, ChevronLeft, ChevronRight, MessageCircle, Sparkles, Trash2, Volume2, VolumeX, Youtube, VideoOff } from 'lucide-react';
import { OriginalPrayer } from '../../../execution/original_prayers_repository';
import { CommentItem } from '../../../execution/comments_types';
import { getCommentsAction, addCommentAction, deleteCommentAction } from '@/app/dashboard/original-prayers/actions';

interface DailyPrayersCarouselProps {
  prayers: OriginalPrayer[];
}

export default function DailyPrayersCarousel({ prayers }: DailyPrayersCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Estados para Modal de Comentários
  const [activeCommentsPrayer, setActiveCommentsPrayer] = useState<OriginalPrayer | null>(null);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const openComments = async (prayer: any) => {
    setActiveCommentsPrayer(prayer);
    setLoadingComments(true);
    try {
      // Carregar usuário logado para autorizar deleções
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);

      const list = await getCommentsAction(prayer.id);
      setCommentsList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!activeCommentsPrayer) return;
    const res = await deleteCommentAction(commentId, activeCommentsPrayer.id);
    if (res.error) {
       alert(`Falha ao excluir: ${res.error}`);
    } else {
       setCommentsList(prev => prev.filter(c => c.id !== commentId));
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (activeCommentsPrayer) {
      // Comments are now loaded via openComments, so this useEffect only handles cleanup
    } else {
       setCommentsList([]);
       setCurrentUserId(null); // Clear user ID when comments modal is closed
    }
    return () => { isMounted = false; };
  }, [activeCommentsPrayer]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeCommentsPrayer) return;
    const commentText = newComment.trim();
    
    // Adição Instantânea na lista (Instante Update)
    setCommentsList(prev => [{
      id: `temp-${Date.now()}`,
      user_id: 'current',
      content: commentText,
      created_at: new Date().toISOString(),
      user_name: 'Você ✨'
    }, ...prev]);
    
    setNewComment('');

    const res = await addCommentAction(activeCommentsPrayer.id, commentText);
    if (res.error) {
       // Se deu erro, removemos o comentário instantâneo e alertamos
       setCommentsList(prev => prev.filter(c => !c.id.startsWith('temp-')));
       alert(res.error === 'PREMIUM_LOCKED' 
         ? 'Comentários são recursos exclusivos para membros Premium! ✨' 
         : `Falha ao comentar: ${res.error}`);
       return;
    }
    
    // Sincronização final
    getCommentsAction(activeCommentsPrayer.id).then(setCommentsList);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: index * width,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const nextSlide = () => {
    if (activeIndex < prayers.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const prevSlide = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  return (
    <div className="relative w-full">
      {/* Scroll Container */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {prayers.map((prayer, index) => (
          <div 
            key={prayer.id} 
            className="group snap-center shrink-0 w-full flex flex-col"
          >
            <div className="relative w-full aspect-[4/4] rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-[#e4e2de]/50 bg-[#042418]">
              {prayer.image_url ? (
                <Image
                  src={prayer.image_url}
                  alt={prayer.title}
                  fill
                  className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-50"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              ) : (
                <Image
                  src="/images/bg-cross-sunset.png"
                  alt="Oração do dia"
                  fill
                  className="object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-50"
                />
              )}
              {/* Overlay gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#042418]/85 via-[#042418]/25 to-transparent" />

              {/* Badge de tema */}
              <div className="absolute top-5 left-5">
                <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/20">
                  {prayer.theme}
                </span>
              </div>

              {/* 🎧📹 Badges de Mídia (Superior Direito) */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5">
                {prayer.audio_url ? (
                  <div className="p-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/20" title="Áudio disponível">
                    <Volume2 className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5" title="Sem áudio">
                    <VolumeX className="w-3.5 h-3.5 text-white/30" />
                  </div>
                )}

                {prayer.youtube_url ? (
                  <div className="p-1.5 rounded-full bg-white/25 backdrop-blur-sm border border-white/20" title="Link/Vídeo disponível">
                    <Youtube className="w-3.5 h-3.5 text-white" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-full bg-black/20 backdrop-blur-sm border border-white/5" title="Sem vídeo">
                    <VideoOff className="w-3.5 h-3.5 text-white/30" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-7">
                <h3 className="text-white font-['Newsreader',serif] text-2xl italic tracking-tight leading-tight line-clamp-2">
                  {prayer.title}
                </h3>
                <p className="text-white/75 font-sans text-sm mt-2 line-clamp-2 leading-relaxed">
                  {prayer.content}
                </p>
                {/* Likes e Comentários */}
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-[#ffdea5]" fill={prayer.has_liked ? "#ffdea5" : "none"} />
                    <span className="text-[#ffdea5] text-xs font-sans font-bold">{prayer.likes_count ?? 0}</span>
                  </div>
                  
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); openComments(prayer); }}
                    className="flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all z-10"
                    aria-label="Comentar"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-white/60" />
                    <span className="text-white/80 text-xs font-sans font-bold">{prayer.comments_count ?? 0}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CTA Button Estático */}
      <Link 
        href={`/dashboard/original-prayers/${prayers[activeIndex]?.id}`} 
        className="w-full mt-4 bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-[#ffdea5] font-sans text-xs font-bold uppercase tracking-[0.2em] py-4 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
      >
        <Feather className="w-4 h-4" /> <span>LER ORAÇÃO</span>
      </Link>

      {/* Setas de Navegação (Flutuantes) */}
      {prayers.length > 1 && (
        <>
          {activeIndex > 0 && (
            <button 
              onClick={prevSlide}
              className="absolute left-2 top-[calc(50%-44px)] -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-all z-10"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {activeIndex < prayers.length - 1 && (
            <button 
              onClick={nextSlide}
              className="absolute right-2 top-[calc(50%-44px)] -translate-y-1/2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-all z-10"
              aria-label="Próxima"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}

      {/* Paginação (Bolinhas) */}
      {prayers.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-3">
          {prayers.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex 
                  ? 'w-4 bg-[#042418]' 
                  : 'w-1.5 bg-[#042418]/30'
              }`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>
      )}
      {/* 🧾 Modal de Comentários */}
      {activeCommentsPrayer && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex flex-col justify-end" onClick={() => setActiveCommentsPrayer(null)}>
          <div className="bg-white rounded-t-[2rem] p-6 pb-28 w-full max-w-md mx-auto flex flex-col h-[75vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-['Newsreader',serif] font-medium text-xl text-[#042418]">Comentários ({commentsList.length})</span>
              <button onClick={() => setActiveCommentsPrayer(null)} className="p-2 text-[#727974] text-xl">✕</button>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 pr-1">
              {loadingComments ? (
                 <span className="text-sm text-center text-[#727974] py-4">Carregando comentários...</span>
              ) : commentsList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#727974]">
                    <Sparkles className="w-8 h-8 text-[#c1b89a]" />
                    <span className="text-sm font-sans">Seja o primeiro a comentar! ✨</span>
                 </div>
              ) : (
                commentsList.map(c => (
                  <div key={c.id} className="border-b border-[#e4e2de]/40 pb-3 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center overflow-hidden border border-[#e4e2de]/40">
                          {c.user_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.user_avatar} alt={c.user_name || 'Usuário'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-white text-[10px] uppercase font-bold">{(c.user_name?.[0] || 'U')}</span>
                          )}
                        </div>
                        <span className="text-xs font-bold font-sans text-[#1b3a2c]">{c.user_name || 'Usuário'}</span>
                      </div>
                      
                      {currentUserId && (currentUserId === c.user_id || currentUserId === activeCommentsPrayer.user_id) && (
                         <button 
                           onClick={() => handleDeleteComment(c.id)} 
                           className="p-1 hover:bg-[#ba1a1a]/10 rounded-full text-[#727974] hover:text-[#ba1a1a] transition-all"
                           title="Excluir"
                         >
                            <Trash2 className="w-3.5 h-3.5" />
                         </button>
                      )}
                    </div>
                    <p className="text-sm text-[#424844] font-sans pl-8 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-4 border-t border-[#e4e2de]/60 mt-2">
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                className="flex-1 bg-[#f5f3ef] rounded-xl px-4 py-2.5 text-sm font-sans focus:outline-none border border-[#e4e2de]/30"
              />
              <button 
                onClick={handleAddComment} 
                className="bg-[#042418] text-[#ffdea5] px-4 py-2.5 rounded-xl text-xs font-bold font-sans uppercase active:scale-95 transition-all shadow-sm"
              >
                 Enviar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

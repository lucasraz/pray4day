'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { OriginalPrayer } from '../../../../execution/original_prayers_repository';
import { CommentItem } from '../../../../execution/comments_types';
import { addCommentAction, getCommentsAction } from './actions';

interface PrayerCardFeedProps {
  prayers: OriginalPrayer[];
  likeAction: (formData: FormData) => Promise<void>;
}

export default function PrayerCardFeed({ prayers, likeAction }: PrayerCardFeedProps) {
  const [activeCommentsPrayer, setActiveCommentsPrayer] = useState<OriginalPrayer | null>(null);
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const openComments = async (prayer: OriginalPrayer) => {
    setActiveCommentsPrayer(prayer);
    setLoadingComments(true);
    try {
      const list = await getCommentsAction(prayer.id);
      setCommentsList(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !activeCommentsPrayer) return;
    const commentText = newComment.trim();

    // Adição Instantânea na lista
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
    const list = await getCommentsAction(activeCommentsPrayer.id);
    setCommentsList(list);
  };

  return (
    <div className="flex flex-col gap-5 flex-1 mt-2">
      {prayers.map((prayer) => (
        <div key={prayer.id} className="relative bg-white border border-[#e4e2de]/30 rounded-2xl p-4 shadow-sm flex flex-col gap-3 overflow-hidden">
          {/* Imagem de fundo sutil */}
          {prayer.image_url && (
            <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
              <Image 
                src={prayer.image_url} 
                alt="" 
                fill
                className="object-cover opacity-[0.08] mix-blend-multiply" 
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          )}

          {/* Top Details */}
          <div className="flex justify-between items-start">
            <Link href={`/dashboard/original-prayers/${prayer.id}`} className="hover:opacity-80 transition-opacity">
              <span className="text-[10px] uppercase font-bold text-[#775a19] tracking-wide">{prayer.theme}</span>
              <h3 className="font-display font-medium text-lg text-[#042418] hover:underline underline-offset-4 decoration-[#775a19]/40">{prayer.title}</h3>
            </Link>
            {prayer.audio_url && (
              <div className="w-8 h-8 rounded-full bg-[#042418] flex items-center justify-center cursor-pointer shadow-md">
                <Play className="w-3 h-3 fill-white text-white translate-x-[1px]" />
              </div>
            )}
          </div>

          {/* Text Context Content */}
          <Link href={`/dashboard/original-prayers/${prayer.id}`} className="hover:opacity-80 transition-opacity">
            <p className="text-[#1b1c1a] font-sans text-sm leading-relaxed line-clamp-3">
              {prayer.content}
            </p>
          </Link>

          {/* Bottom Actions Footer */}
          <div className="flex justify-between items-center mt-2 pt-3 border-t border-[#e4e2de]/30 z-10">
            <form action={likeAction}>
              <input type="hidden" name="prayerId" value={prayer.id} />
              <button type="submit" className="flex items-center gap-1.5 text-[#727974] hover:text-[#ba1a1a] transition-all">
                <Heart className={`w-4 h-4 ${prayer.has_liked ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
                <span className="text-xs font-bold">{prayer.likes_count || 0}</span>
              </button>
            </form>

            <button 
              onClick={() => openComments(prayer)}
              className="flex items-center gap-1.5 text-[#727974] hover:text-[#042418] transition-all z-20"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{prayer.comments_count ?? 0}</span>
            </button>
          </div>
        </div>
      ))}

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
                 <span className="text-xs text-center text-[#727974] py-4">Carregando comentários...</span>
              ) : commentsList.length === 0 ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-1 text-[#727974]">
                    <Sparkles className="w-6 h-6 text-[#c1b89a]/40" />
                    <span className="text-sm font-sans">Seja o primeiro a comentar! ✨</span>
                 </div>
              ) : (
                commentsList.map(c => (
                  <div key={c.id} className="border-b border-[#e4e2de]/20 pb-2 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-[#042418] to-[#1b3a2c] rounded-full flex items-center justify-center overflow-hidden">
                        {c.user_avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={c.user_avatar} alt={c.user_name || 'Usuário'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-[9px] font-bold">{(c.user_name?.[0] || 'U')}</span>
                        )}
                      </div>
                      <span className="text-xs font-bold font-sans text-[#1b3a2c]">{c.user_name || 'Usuário'}</span>
                    </div>
                    <p className="text-xs text-[#424844] font-sans pl-7 leading-relaxed">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 pt-4 border-t border-[#e4e2de]/40 mt-1">
              <input 
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Adicionar comentário..."
                className="flex-1 bg-[#f5f3ef] rounded-xl px-3 py-2 text-sm font-sans focus:outline-none border border-[#e4e2de]/20"
              />
              <button 
                onClick={handleAddComment} 
                className="bg-[#042418] text-[#ffdea5] px-3 py-2 rounded-xl text-xs font-bold font-sans active:scale-95 transition-all shadow-sm"
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

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle, Sparkles } from 'lucide-react';
import { getCommentsAction, addCommentAction } from '@/app/dashboard/original-prayers/actions';
import { getChainCommentsAction, addChainCommentAction } from '@/app/dashboard/prayer-chains/actions';
import { CommentItem } from '../../../execution/comments_types';

interface CommentsSectionProps {
  prayerId?: string;
  chainId?: string;
}

export default function CommentsSection({ prayerId, chainId }: CommentsSectionProps) {
  const [commentsList, setCommentsList] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    try {
      const list = prayerId 
        ? await getCommentsAction(prayerId)
        : chainId 
        ? await getChainCommentsAction(chainId)
        : [];
      setCommentsList(list);
    } catch (e) {
      console.error('Falha ao carregar comentários', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [prayerId, chainId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = prayerId 
        ? await addCommentAction(prayerId, newComment)
        : chainId 
        ? await addChainCommentAction(chainId, newComment)
        : { error: 'ID inválido' };

      if (res.error === 'PREMIUM_LOCKED') {
        alert('Comentários são recursos exclusivos para membros Premium! ✨');
        return;
      }
      
      setNewComment('');
      loadComments();
    } catch (e) {
      console.error('Erro ao comentar', e);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-white border border-[#e4e2de]/40 rounded-3xl p-5 shadow-sm mt-4">
      <h2 className="text-xs uppercase font-bold text-[#775a19] tracking-wider mb-2 flex items-center gap-2">
        <MessageCircle className="w-4 h-4" /> Comentários ({commentsList.length})
      </h2>

      {/* Lista */}
      <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
        {loading ? (
          <span className="text-xs text-[#727974] text-center">Carregando comentários...</span>
        ) : commentsList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4 gap-1 text-[#727974]">
             <Sparkles className="w-6 h-6 text-[#c1b89a]/40" />
             <span className="text-xs font-sans text-center">Ninguém comentou ainda.<br/>Seja o primeiro! ✨</span>
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
      <div className="flex items-center gap-2 pt-3 border-t border-[#e4e2de]/40 mt-1">
        <input 
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="Adicionar comentário..."
          className="flex-1 bg-[#f5f3ef] rounded-xl px-3 py-2 text-xs font-sans focus:outline-none border border-[#e4e2de]/20"
        />
        <button 
          onClick={handleAddComment} 
          className="bg-[#042418] text-[#ffdea5] px-3 py-2 rounded-xl text-xs font-bold font-sans active:scale-95 transition-all shadow-sm"
        >
           Enviar
        </button>
      </div>
    </div>
  );
}

-- ==========================================
-- 🛠️ SUPABASE SQL SETUP - ORIGINAL PRAYERS
-- Copie e cole este script no seu 'SQL Editor' do Supabase
-- ==========================================

-- 1. Criar a Tabela de Orações Originais
CREATE TABLE IF NOT EXISTS public.original_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    theme TEXT NOT NULL CHECK (theme IN ('Ansiedade', 'Família', 'Prosperidade', 'Provação')),
    content TEXT NOT NULL, -- Conteúdo de texto ou transcrição
    audio_url TEXT NULL,   -- Link para o bucket do Storage de áudio
    youtube_url TEXT NULL, -- Link para vídeo do YouTube
    duration INT DEFAULT 0, -- Duração em segundos para controle de limite (30s / 60s)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar a Tabela de Curtidas (Likes) para Evitar Abuso
CREATE TABLE IF NOT EXISTS public.likes_original_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prayer_id UUID NOT NULL REFERENCES public.original_prayers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayer_id, user_id) -- Garante apenas 1 curtida por usuário
);

-- 3. Ativar Row Level Security (RLS)
ALTER TABLE public.original_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes_original_prayers ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para 'original_prayers'
CREATE POLICY "Permitir leitura pública de orações"
ON public.original_prayers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuário pode criar suas próprias orações"
ON public.original_prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode deletar suas próprias orações"
ON public.original_prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Políticas para 'likes_original_prayers'
CREATE POLICY "Leitura de curtidas para todos"
ON public.likes_original_prayers FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuário pode curtir orações"
ON public.likes_original_prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário pode descurtir orações"
ON public.likes_original_prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Bucket Storage para Áudios (Criado via código)
-- Garante que o bucket e as politicas corretas de RLS existam

INSERT INTO storage.buckets (id, name, public)
VALUES ('prayers-audio', 'prayers-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de RLS para o Storage
-- A. Permitir leitura pública para todos no bucket especifico
CREATE POLICY "Leitura de áudio pública"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'prayers-audio');

-- B. Permitir inserção APENAS a usuários logados
CREATE POLICY "Usuários logados podem fazer upload de áudios"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prayers-audio' AND auth.uid() = owner);

-- C. (Opcional) Usuários apagam os próprios áudios
CREATE POLICY "Usuários apagam próprios áudios"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'prayers-audio' AND auth.uid() = owner);

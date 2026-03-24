-- ==========================================
-- SUPABASE SQL SETUP - ATUALIZAÇÃO DE PERFIL
-- Copie e cole este script no seu 'SQL Editor' do Supabase
-- Ele adiciona os campos de perfil do usuário.
-- ==========================================

-- 1. Adicionar colunas (seguro rodar mais de uma vez)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_name TEXT,
ADD COLUMN IF NOT EXISTS faith_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS display_name_preference TEXT DEFAULT 'social',
ADD COLUMN IF NOT EXISTS selected_themes TEXT[] DEFAULT '{}';

-- 2. Permitir INSERT para que o upsert funcione caso o perfil ainda não exista  
-- (DROP + CREATE é o jeito correto no PostgreSQL, IF NOT EXISTS não existe para policies)
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;
CREATE POLICY "profile_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Permitir LEITURA (SELECT) para que criadores das orações/correntes apareçam para todos
DROP POLICY IF EXISTS "profile_select_all" ON public.profiles;
CREATE POLICY "profile_select_all"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- 4. Criar Bucket de Armazenamento para Avatares (Foto de Perfil)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket de Avatares

-- Leitura Pública
DROP POLICY IF EXISTS "avatars_read" ON storage.objects;
CREATE POLICY "avatars_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

-- Usuários logados fazem upload
DROP POLICY IF EXISTS "avatars_upload" ON storage.objects;
CREATE POLICY "avatars_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Usuários logados atualizam (UPSERT) as próprias imagens
DROP POLICY IF EXISTS "avatars_update" ON storage.objects;
CREATE POLICY "avatars_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Usuários logados apagam as próprias imagens
DROP POLICY IF EXISTS "avatars_delete" ON storage.objects;
CREATE POLICY "avatars_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

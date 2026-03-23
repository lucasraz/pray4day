-- ==========================================
-- 🛠️ SUPABASE SQL SETUP - ATUALIZAÇÃO DE PERFIL
-- Copie e cole este script no seu 'SQL Editor' do Supabase
-- Ele adiciona os campos de perfil do usuário.
-- ==========================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS social_name TEXT,
ADD COLUMN IF NOT EXISTS faith_name TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS display_name_preference TEXT DEFAULT 'social'; -- 'social' ou 'faith'

-- Permitir INSERT para que o upsert funcione caso o perfil ainda não exista  
CREATE POLICY IF NOT EXISTS "Usuário pode inserir seu próprio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

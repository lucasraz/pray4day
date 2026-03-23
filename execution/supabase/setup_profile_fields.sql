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
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

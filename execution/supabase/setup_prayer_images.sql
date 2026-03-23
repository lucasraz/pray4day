-- ==========================================
-- SUPABASE SQL - Adicionar imagem às orações originais
-- Cole no SQL Editor do Supabase e execute
-- ==========================================

-- 1. Adicionar coluna image_url na tabela de orações originais
ALTER TABLE public.original_prayers
  ADD COLUMN IF NOT EXISTS image_url TEXT NULL;

-- 2. Criar bucket de imagens para orações (público)
INSERT INTO storage.buckets (id, name, public)
VALUES ('prayers-images', 'prayers-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas RLS para o bucket de imagens

-- Leitura pública
DROP POLICY IF EXISTS "prayer_images_read" ON storage.objects;
CREATE POLICY "prayer_images_read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'prayers-images');

-- Usuários logados fazem upload
DROP POLICY IF EXISTS "prayer_images_upload" ON storage.objects;
CREATE POLICY "prayer_images_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'prayers-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Usuários apagam as próprias imagens
DROP POLICY IF EXISTS "prayer_images_delete" ON storage.objects;
CREATE POLICY "prayer_images_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'prayers-images' AND auth.uid()::text = (storage.foldername(name))[1]);

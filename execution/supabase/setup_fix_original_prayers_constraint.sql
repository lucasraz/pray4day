-- ==========================================
-- SUPABASE SQL - Correção de Restrição de Temas (Orações)
-- Cole e execute no SQL Editor do Supabase para destravar a publicação
-- ==========================================

-- Remove a restrição antiga que bloqueava novas categorias
ALTER TABLE original_prayers 
DROP CONSTRAINT IF EXISTS original_prayers_theme_check;

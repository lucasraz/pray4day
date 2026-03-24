-- ==========================================
-- SETUP COMENTÁRIOS (ORAÇÕES E CORRENTES)
-- ==========================================

-- 1. Tabela de Comentários para Orações Originais
CREATE TABLE IF NOT EXISTS comments_original_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prayer_id UUID NOT NULL REFERENCES original_prayers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 300), -- Limite contra spam
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Comentários para Correntes de Oração
CREATE TABLE IF NOT EXISTS comments_prayer_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES prayer_chains(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (length(content) <= 300), -- Limite contra spam
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Ativar RLS (Row Level Security)
ALTER TABLE comments_original_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments_prayer_chains ENABLE ROW LEVEL SECURITY;

-- 4. Limpar Políticas Antigas para evitar colisões
DROP POLICY IF EXISTS "Permitir leitura pública de comentários de orações" ON comments_original_prayers;
DROP POLICY IF EXISTS "Permitir leitura pública de comentários de correntes" ON comments_prayer_chains;
DROP POLICY IF EXISTS "Permitir inserção de comentários por usuários autenticados (Orações)" ON comments_original_prayers;
DROP POLICY IF EXISTS "Permitir inserção de comentários por usuários autenticados (Correntes)" ON comments_prayer_chains;
DROP POLICY IF EXISTS "Permitir deleção aos autores (Orações)" ON comments_original_prayers;
DROP POLICY IF EXISTS "Permitir deleção aos autores (Correntes)" ON comments_prayer_chains;
DROP POLICY IF EXISTS "Permitir deleção aos autores ou criador do card (Orações)" ON comments_original_prayers;
DROP POLICY IF EXISTS "Permitir deleção aos autores ou criador da corrente (Correntes)" ON comments_prayer_chains;

-- 5. Criar Políticas de Leitura (Qualquer um autenticado pode ler)
CREATE POLICY "Permitir leitura pública de comentários de orações" 
ON comments_original_prayers FOR SELECT USING (true);

CREATE POLICY "Permitir leitura pública de comentários de correntes" 
ON comments_prayer_chains FOR SELECT USING (true);

-- 6. Criar Políticas de Escrita (Somente o próprio user_id criador)
-- A verificação se é Premium será feita na API/Repository no Back-end!
CREATE POLICY "Permitir inserção de comentários por usuários autenticados (Orações)" 
ON comments_original_prayers FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Permitir inserção de comentários por usuários autenticados (Correntes)" 
ON comments_prayer_chains FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 7. Criar Políticas de Deleção (Autor do comentário OU Criador do Card)
CREATE POLICY "Permitir deleção aos autores ou criador do card (Orações)" 
ON comments_original_prayers FOR DELETE USING (
  auth.uid() = user_id 
  OR auth.uid() = (SELECT user_id FROM original_prayers WHERE id = prayer_id)
);

CREATE POLICY "Permitir deleção aos autores ou criador da corrente (Correntes)" 
ON comments_prayer_chains FOR DELETE USING (
  auth.uid() = user_id 
  OR auth.uid() = (SELECT user_id FROM prayer_chains WHERE id = chain_id)
);

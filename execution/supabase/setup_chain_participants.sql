-- ==========================================
-- SUPABASE SQL - Participantes de Correntes
-- Cole e execute no SQL Editor do Supabase
-- ==========================================

-- Tabela de adesão às correntes
CREATE TABLE IF NOT EXISTS public.prayer_chain_participants (
  chain_id UUID NOT NULL REFERENCES public.prayer_chains(id) ON DELETE CASCADE,
  user_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chain_id, user_id)  -- garante que cada pessoa adere só uma vez
);

ALTER TABLE public.prayer_chain_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "participants_select" ON public.prayer_chain_participants;
DROP POLICY IF EXISTS "participants_insert" ON public.prayer_chain_participants;
DROP POLICY IF EXISTS "participants_delete" ON public.prayer_chain_participants;

-- Todos os autenticados podem ver quantos participam
CREATE POLICY "participants_select"
  ON public.prayer_chain_participants FOR SELECT
  TO authenticated USING (true);

-- Cada um pode aderir por conta própria
CREATE POLICY "participants_insert"
  ON public.prayer_chain_participants FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Cada um pode sair por conta própria
CREATE POLICY "participants_delete"
  ON public.prayer_chain_participants FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

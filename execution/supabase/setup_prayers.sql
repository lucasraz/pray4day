-- ==========================================
-- 🛠️ SUPABASE SQL SETUP - PRAYERS TABLE
-- Copie e cole este script no seu 'SQL Editor' do Supabase
-- ==========================================

-- 1. Criar a Tabela de Orações
CREATE TABLE IF NOT EXISTS public.prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Ansiedade', 'Família', 'Prosperidade', 'Provação')),
    audio_url TEXT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ativar Row Level Security (RLS) para Segurança
ALTER TABLE public.prayers ENABLE ROW LEVEL SECURITY;

-- 3. Criar Política de Leitura (Qualquer usuário AUTENTICADO pode ler)
CREATE POLICY "Permitir leitura para autenticados"
ON public.prayers
FOR SELECT
TO authenticated
USING (true);

-- 4. Dados Iniciais (Seeding) para Testes
INSERT INTO public.prayers (title, content, category, is_premium)
VALUES 
('Confie no Senhor', 'Senhor, eu entrego minhas preocupações em Tuas mãos. Me ajuda a confiar no Teu plano e dá paz ao meu coração. Sei que Tu estás comigo em todo tempo.', 'Ansiedade', FALSE),
('União Familiar', 'Senhor, abençoe meu lar e minha família. Que haja respeito, paciência e amor entre nós todos os dias e que sua luz nos guie.', 'Família', FALSE),
('Portas Abertas', 'Pai, obrigado por prover e cuidar de mim. Que as portas da prosperidade e oportunidades se abram para o meu trabalho.', 'Prosperidade', FALSE);

-- ==========================================
-- 🛠️ SUPABASE SQL SETUP - PLANO PREMIUM (Stripe)
-- Copie e cole este script no seu 'SQL Editor' do Supabase
-- Ele cria ou atualiza as tabelas para gerenciar assinaturas
-- ==========================================

-- 1. Tabela de Perfis de Usuário (Para salvar status Premium)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    is_premium BOOLEAN DEFAULT FALSE,
    stripe_customer_id TEXT NULL,
    stripe_subscription_id TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- O usuário só pode ler o próprio perfil e editar (mas a role de ADMIN fará override)
CREATE POLICY "Usuário pode ler seu próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuário pode atualizar seu perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Tabela de Orações Favoritas (Apenas para assinantes ou liberação de teste)
CREATE TABLE IF NOT EXISTS public.favorite_prayers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prayer_id UUID NOT NULL REFERENCES public.original_prayers(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(prayer_id, user_id)
);

-- Ativar RLS
ALTER TABLE public.favorite_prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ler favoritos" ON public.favorite_prayers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Gerenciar favoritos (Insert)" ON public.favorite_prayers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Gerenciar favoritos (Delete)" ON public.favorite_prayers FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Gatilho (Trigger) para auto-criar um perfil quando um usuário se cadastra (Opcional, mas recomendado)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, is_premium)
  VALUES (new.id, FALSE);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se o gatilho não existir, cria-se o atalho. Substitui a cada script run para garantir estabilidade
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Nota de Backfill: Se você já tiver usuários que NÃO tem perfil, rodar isso resolve o buraco negro:
INSERT INTO public.profiles (id, is_premium)
SELECT id, FALSE FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

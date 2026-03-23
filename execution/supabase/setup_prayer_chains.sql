-- ==========================================
-- SUPABASE SQL SETUP - CORRENTES DE ORAÇÃO
-- Cole no SQL Editor do Supabase e execute
-- ==========================================

-- 1. Catálogo de Orações Pré-definidas
CREATE TABLE IF NOT EXISTS public.predefined_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT DEFAULT 'Geral',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: leitura pública, escrita só admin (service role)
ALTER TABLE public.predefined_prayers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "predefined_prayers_read" ON public.predefined_prayers;
CREATE POLICY "predefined_prayers_read" ON public.predefined_prayers FOR SELECT TO authenticated USING (true);

-- 2. Correntes de Oração
CREATE TABLE IF NOT EXISTS public.prayer_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  purpose TEXT,
  category TEXT DEFAULT 'Geral',
  start_date DATE NOT NULL,
  end_date DATE,
  execution_time TIME NOT NULL,
  periodicity TEXT[] NOT NULL DEFAULT '{daily}', -- ex: '{daily}' ou '{mon,wed,fri}'
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.prayer_chains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chains_select" ON public.prayer_chains;
DROP POLICY IF EXISTS "chains_insert" ON public.prayer_chains;
DROP POLICY IF EXISTS "chains_update" ON public.prayer_chains;
DROP POLICY IF EXISTS "chains_delete" ON public.prayer_chains;
CREATE POLICY "chains_select" ON public.prayer_chains FOR SELECT TO authenticated USING (true); -- todos veem correntes (feed público)
CREATE POLICY "chains_insert" ON public.prayer_chains FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chains_update" ON public.prayer_chains FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "chains_delete" ON public.prayer_chains FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. Itens de cada Corrente (orações selecionadas)
CREATE TABLE IF NOT EXISTS public.prayer_chain_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chain_id UUID NOT NULL REFERENCES public.prayer_chains(id) ON DELETE CASCADE,
  predefined_prayer_id UUID REFERENCES public.predefined_prayers(id) ON DELETE SET NULL,
  custom_prayer_name TEXT,     -- se o usuário escreveu uma oração própria
  custom_prayer_text TEXT,     -- conteúdo da oração personalizada
  quantity INT NOT NULL DEFAULT 1,
  order_index INT NOT NULL DEFAULT 0
);

ALTER TABLE public.prayer_chain_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chain_items_select" ON public.prayer_chain_items;
DROP POLICY IF EXISTS "chain_items_insert" ON public.prayer_chain_items;
DROP POLICY IF EXISTS "chain_items_delete" ON public.prayer_chain_items;
CREATE POLICY "chain_items_select" ON public.prayer_chain_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "chain_items_insert" ON public.prayer_chain_items FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.prayer_chains WHERE id = chain_id AND user_id = auth.uid())
);
CREATE POLICY "chain_items_delete" ON public.prayer_chain_items FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.prayer_chains WHERE id = chain_id AND user_id = auth.uid())
);

-- ==========================================
-- SEED: Orações Pré-definidas
-- ==========================================
INSERT INTO public.predefined_prayers (name, category, content) VALUES

('Sinal da Cruz', 'Orações Básicas', 'Pelo sinal da santa‑cruz, libertai‑nos Deus nosso Senhor de nossos inimigos. Em nome do Pai, e do Filho e do Espírito Santo. Amém.'),

('Pai‑Nosso', 'Orações Básicas', 'Pai‑Nosso, que estais nos céus, santificado seja o Vosso Nome,
venha a nós o Vosso Reino,
seja feita a Vossa vontade assim na terra como no céu.
O pão nosso de cada dia nos dai hoje,
e perdoai‑nos as nossas ofensas, assim como nós perdoamos a quem nos tenha ofendido,
e não nos deixeis cair em tentação, mas livrai‑nos do mal. Amém.'),

('Ave‑Maria', 'Orações Básicas', 'Ave‑Maria, cheia de graça, o Senhor é convosco;
bendita sois vós entre as mulheres e
bendito é o fruto do vosso ventre, Jesus.
Santa‑Maria, Mãe de Deus,
rogai por nós, pecadores,
agora e na hora de nossa morte. Amém.'),

('Credo (Símbolo dos Apóstolos)', 'Orações Básicas', 'Creio em Deus Pai todo‑poderoso,
Criador do céu e da terra.
E em Jesus Cristo, seu único Filho, nosso Senhor,
que foi concebido pelo poder do Espírito Santo,
nasceu da Virgem Maria,
padeceu sob Pôncio Pilatos,
foi crucificado, morto e sepultado.
Desceu à mansão dos mortos,
ressuscitou ao terceiro dia,
subiu aos céus e está sentado à direita de Deus Pai todo‑poderoso,
de onde há de vir para julgar os vivos e os mortos.
Creio no Espírito Santo,
na santa Igreja Católica,
na comunhão dos santos,
na remissão dos pecados,
na ressurreição da carne,
na vida eterna. Amém.'),

('Glória ao Pai', 'Orações Básicas', 'Glória ao Pai, ao Filho e ao Espírito Santo.
Como era no princípio,
agora e sempre,
e pelos séculos dos séculos. Amém.'),

('Glória a Deus nas Alturas', 'Louvor', 'Glória a Deus nas alturas e paz na terra aos homens por Ele amados.
Senhor Deus, Rei dos céus, Deus Pai todo‑poderoso:
nós Vos louvamos, nós Vos bendizemos, nós Vos adoramos,
nós Vos glorificamos, nós Vos damos graças por Vossa imensa glória.
Senhor Jesus Cristo, Filho Unigênito, Senhor Deus,
Cordeiro de Deus, Filho de Deus Pai,
Vós que tirais o pecado do mundo, tende piedade de nós;
Vós que tirais o pecado do mundo, acolhei a nossa súplica;
Vós que estais à direita do Pai, tende piedade de nós.
Só Vós sois Santo,
só Vós sois o Senhor,
só Vós sois o Altíssimo, Jesus Cristo,
com o Espírito Santo, na glória de Deus Pai. Amém.'),

('Ato de Contrição', 'Arrependimento', 'Meu Deus, eu me arrependo de todo o coração de Vos ter ofendido,
porque sois infinitamente bom,
e prometo firmemente emendar‑me,
com a ajuda da Vossa graça. Amém.'),

('Confiteor (Confesso a Deus)', 'Arrependimento', 'Confesso a Deus Todo‑poderoso,
à Bem‑Aventurada sempre Virgem Maria,
ao bem‑aventurado São Miguel Arcanjo,
ao bem‑aventurado São João Batista,
aos santos Apóstolos São Pedro e São Paulo,
a todos os Santos
e a vós, irmãos,
porque pequei muitas vezes por pensamentos, palavras e obras,
por minha culpa, minha culpa, minha máxima culpa.
Por isso rogo a Deus Todo‑poderoso que me faça digno de perdoar‑me e conceder‑me a vida eterna. Amém.'),

('Salve‑Rainha', 'Nossa Senhora', 'Salve, Rainha, Mãe de misericórdia,
vida, doçura e esperança nossa, salve!
A vós bradamos, os degredados filhos de Eva;
a vós suspiramos, gemendo e chorando neste vale de lágrimas.
Eia, pois, advogada nossa,
esses vossos olhos misericordiosos a nós volvei;
e depois deste desterro mostrai‑nos Jesus,
bendito fruto do vosso ventre,
ó clemente, ó piedosa, ó doce sempre Virgem Maria. Amém.'),

('Consagração a Nossa Senhora', 'Nossa Senhora', 'Ó Senhora minha, ó minha Mãe,
eu me ofereço todo a vós,
e em prova da minha devoção para convosco,
vos consagro neste dia
os meus olhos, os meus ouvidos,
a minha boca, o meu coração
e inteiramente todo o meu ser.
E porque assim sou vosso,
ó incomparável Mãe,
guardai‑me e defendei‑me como coisa e propriedade vossa. Amém.'),

('Lembrai‑Vos (Memorare)', 'Nossa Senhora', 'Lembrai‑vos, ó piíssima Virgem Maria,
que nunca se ouviu dizer que alguém tivesse recorrido à Vossa proteção,
invocando‑Vos, implorando‑Vos e Vos sendo abandonado.
Confundido com esta esperança,
também venho a Vós, Virgem entre todas singular,
Mãe de Jesus Cristo,
porém, mamãe de misericórdia,
a Vós recorro, a Vós corro, a Vós venho gemendo,
carregado de pecados.
Não desprezeis minhas súplicas,
ó Mãe do Filho de Deus,
antes dai‑as acolhimento benigno e atendei‑as. Amém.'),

('À Vossa Proteção', 'Nossa Senhora', 'À Vossa proteção nos recorremos,
Santa Mãe de Deus;
não desprezeis as nossas súplicas
em nossas necessidades,
mas livrai‑nos de todos os perigos,
ó Virgem gloriosa e bendita. Amém.'),

('Vinde, Espírito Santo', 'Espírito Santo', 'Vinde, Espírito Santo,
encherei o coração dos vossos fiéis
e acendei neles o fogo do vosso amor.
Enviai o vosso Espírito e tudo será criado,
e renovareis a face da terra.
Oremos: Ó Deus, que instruístes os corações dos vossos fiéis com a luz do Espírito Santo, fazei que apreciemos retamente todas as coisas e gozemos sempre da sua consolação. Por Cristo, Nosso Senhor. Amém.'),

('Santo Anjo da Guarda', 'Anjos', 'Santo Anjo do Senhor,
meu zeloso guardador,
se a ti Deus me confiou,
nunca me deixes, meu bom anjo. Amém.'),

('São Miguel Arcanjo', 'Anjos', 'São Miguel Arcanjo, defendei‑nos no combate,
sede o nosso refúgio contra as maldades e ciladas do demônio.
Ordene‑lhe Deus, instantemente o pedimos,
e vós, príncipe da milícia celeste, pela virtude divina,
precipitai no inferno a Satanás
e a todos os espíritos malignos
que andam pelo mundo para perder as almas. Amém.'),

('Ato de Fé', 'Atos Teologais', 'Meu Deus, eu creio em Vós, Pai todo‑poderoso,
Criador do céu e da terra,
e em Jesus Cristo, vosso Filho,
que morreu e ressuscitou pelos nossos pecados,
e em Vós, Espírito Santo,
alma de minha alma.
Eu creio firmemente tudo quanto a Santa Igreja crê,
ensina e professa.
Ofereço‑me para sempre a Vós,
e Vos amo sobre todas as coisas. Amém.'),

('Ato de Esperança', 'Atos Teologais', 'Meu Deus, espero obtê‑lo por Vós,
que sois todo‑poderoso e fiel
na promessa da remissão dos pecados,
na remissão da pena e na vida eterna para os que Vos servem.
Pelos méritos de Jesus Cristo,
espero alcançar a Vossa graça e a vida eterna. Amém.'),

('Ato de Caridade', 'Atos Teologais', 'Meu Deus, amo‑Vos de todo o coração,
porque sois infinitamente bom,
e amo ao próximo como a mim mesmo,
por amor de Vós.
Prometo‑Vos servir e agradar‑Vos sempre,
com a ajuda da Vossa graça. Amém.'),

('Bendito Seja Deus', 'Louvor', 'Bendito seja Deus.
Bendito seja o seu Santo Nome.
Bendito seja Jesus Cristo, verdadeiro Deus e verdadeiro homem.
Bendito seja o Santo Espírito Santo.
Bendita seja a Santíssima Virgem Maria, Mãe de Deus.
Bendito seja São Miguel Arcanjo.
Benditos sejam todos os anjos e santos de Deus.
Bendito seja o Sagrado Coração de Jesus.
Bendito seja o Coração Imaculado de Maria.
Bendito seja o Senhor, agora e sempre. Amém.')

ON CONFLICT DO NOTHING;

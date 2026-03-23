import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Carrega variáveis do arquivo .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Precisamos de permissão de admin para inserir em massa

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
  const filePath = path.join(process.cwd(), 'versiculos_biblicos_completos.txt')
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  let currentCategory = null
  const versesToInsert = []

  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Pula linhas vazias
    if (!trimmedLine) continue

    // Detecta categoria (geralmente tem um emoji e traços abaixo, ou é toda em MAIÚSCULAS)
    // No arquivo: "🙏 CONFIANÇA / FÉ", "----------------"
    if (trimmedLine.match(/^[-]{3,}$/)) continue // Pula se for apenas traços

    const categoryMatch = trimmedLine.match(/^---\s*([^()\-\d]+?)\s*(?:\([^)]+\))?\s*---$/)
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim()
      console.log(`📂 Categoria encontrada: ${currentCategory}`)
      continue
    }

    // Se não for categoria nem traço, deve ser um versículo
    // Formato: "Referência: Texto"
    // Exemplo: "Salmos 23:1: O Senhor é o meu pastor; nada me faltará."
    // Precisamos separar a referência do texto.
    // O primeiro ":" separa a referência (ex: "Salmos 23:1") do texto ("O Senhor é...")
    // Mas a referência pode ter ":" se for versículo (ex: "23:1").
    // Na verdade, o formato é "Livro Capitulo:Versiculo: Texto" ou "Livro Capitulo:Versiculo-Versiculo: Texto"
    // Vamos procurar o ÚLTIMO ":" que separa a referência do texto? 
    // Não, a referência tem ":".
    // "Salmos 23:1: O Senhor..." -> O primeiro ":" é da referência "23:1"? 
    // Na verdade, "Salmos 23:1" tem um ":". 
    // Se dividirmos por ": ", podemos ter problemas se o texto tiver ": ".
    // Vamos analisar a linha "Salmos 23:1: O Senhor..."
    // Se dividirmos por ": ":
    // Parte 1: "Salmos 23:1"
    // Parte 2: "O Senhor é o meu pastor; nada me faltará."
    // Isso parece funcionar para a maioria.
    
    // Vamos tentar dividir pelo padrão ": " que separa a referência do texto.
    // Note que pode haver espaços múltiplos ou travessão.
    const parts = trimmedLine.split(': ')
    if (parts.length >= 2) {
      const reference = parts[0].trim()
      const text = parts.slice(1).join(': ').trim() // Junta o resto de volta caso o texto tenha ": "

      if (reference && text && currentCategory) {
        // Evita duplicados na mesma carga
        if (!versesToInsert.some(v => v.reference === reference)) {
          versesToInsert.push({
            category: currentCategory,
            reference: reference,
            text: text
          })
        }
      }
    } else {
      // Tenta outro separador se houver, ou loga erro
      console.warn(`⚠️ Linha ignorada ou formato estranho: "${trimmedLine}"`)
    }
  }

  console.log(`📊 Total de versículos para inserir: ${versesToInsert.length}`)

  if (versesToInsert.length === 0) {
    console.log('Nenhum versículo encontrado para inserir.')
    return
  }

  // Primeiro, cria as tabelas se não existirem (via RPC ou simplesmente inserindo se já existirem)
  // Como não podemos criar tabelas via client-side facilmente sem RPC admin,
  // vamos assumir que as tabelas devem ser criadas via SQL primeiro.
  // Ou podemos tentar rodar um SQL via `supabase.rpc` se houver, mas mais seguro é gerar o SQL.
  
  // Vamos apenas gerar o SQL com os INSERTs também para o usuário rodar no painel.
  let sqlContent = `-- ==========================================\n`
  sqlContent += `-- 🛠️ SUPABASE SQL SETUP - VERSÍCULOS DO DIA\n`
  sqlContent += `-- ==========================================\n\n`
  
  sqlContent += `-- 1. Criar a Tabela de Versículos\n`
  sqlContent += `CREATE TABLE IF NOT EXISTS public.verses (\n`
  sqlContent += `    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n`
  sqlContent += `    category TEXT NOT NULL,\n`
  sqlContent += `    reference TEXT NOT NULL,\n`
  sqlContent += `    text TEXT NOT NULL,\n`
  sqlContent += `    created_at TIMESTAMPTZ DEFAULT NOW()\n`
  sqlContent += `);\n\n`

  sqlContent += `-- 2. Criar a Tabela de Versículo do Dia (Histórico)\n`
  sqlContent += `CREATE TABLE IF NOT EXISTS public.verse_of_the_day (\n`
  sqlContent += `    date DATE PRIMARY KEY DEFAULT CURRENT_DATE,\n`
  sqlContent += `    verse_id UUID NOT NULL REFERENCES public.verses(id) ON DELETE CASCADE,\n`
  sqlContent += `    created_at TIMESTAMPTZ DEFAULT NOW()\n`
  sqlContent += `);\n\n`

  sqlContent += `-- 3. Ativar RLS\n`
  sqlContent += `ALTER TABLE public.verses ENABLE ROW LEVEL SECURITY;\n`
  sqlContent += `ALTER TABLE public.verse_of_the_day ENABLE ROW LEVEL SECURITY;\n\n`

  sqlContent += `-- 4. Políticas\n`
  sqlContent += `DROP POLICY IF EXISTS "Permitir leitura pública de versículos" ON public.verses;\n`
  sqlContent += `CREATE POLICY "Permitir leitura pública de versículos" ON public.verses FOR SELECT TO authenticated USING (true);\n\n`
  
  sqlContent += `DROP POLICY IF EXISTS "Permitir leitura pública de versículo do dia" ON public.verse_of_the_day;\n`
  sqlContent += `CREATE POLICY "Permitir leitura pública de versículo do dia" ON public.verse_of_the_day FOR SELECT TO authenticated USING (true);\n\n`

  sqlContent += `-- 5. Inserir Versículos\n`
  sqlContent += `INSERT INTO public.verses (category, reference, text) VALUES\n`

  const sqlValues = versesToInsert.map(v => {
    // Escapar aspas simples para SQL
    const safeText = v.text.replace(/'/g, "''")
    const safeRef = v.reference.replace(/'/g, "''")
    const safeCat = v.category.replace(/'/g, "''")
    return `('${safeCat}', '${safeRef}', '${safeText}')`
  })

  sqlContent += sqlValues.join(',\n') + ';\n'

  const outputSqlPath = path.join(process.cwd(), 'execution', 'supabase', 'setup_verses.sql')
  fs.writeFileSync(outputSqlPath, sqlContent)
  console.log(`✅ SQL gerado com sucesso em: ${outputSqlPath}`)

  // Agora vamos tentar inserir via API para automatizar
  console.log('⏳ Iniciando inserção via API...')
  
  // Limpa tabela anterior para evitar duplicatas se rodar de novo
  const { error: deleteError } = await supabase.from('verses').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Deleta todos
  if (deleteError) {
    console.warn('⚠️ Nota: Não foi possível limpar a tabela (pode não existir ainda). Tentando criar via RPC?')
    console.error(deleteError)
    console.log('👉 Por favor, execute o arquivo SQL gerado no painel do Supabase.')
    return
  }

  // Insere em lotes de 50 para não estourar limite
  const batchSize = 50
  for (let i = 0; i < versesToInsert.length; i += batchSize) {
    const batch = versesToInsert.slice(i, i + batchSize)
    const { error } = await supabase.from('verses').insert(batch)
    if (error) {
      console.error(`❌ Erro ao inserir lote ${i / batchSize + 1}:`, error)
      console.log('👉 Por favor, use o arquivo SQL gerado para inserção manual.')
      return
    }
    console.log(`✅ Lote ${i / batchSize + 1} inserido (${batch.length} itens)`)
  }

  console.log('🎉 Todos os versículos foram inseridos com sucesso!')
}

main().catch(console.error)

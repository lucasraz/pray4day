import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Carrega variáveis do arquivo .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Erro: Forneça o UUID do usuário como argumento.');
    console.log('👉 Exemplo: node execution/populate_prayers.mjs d5447b98-aa2c-4600-a457-...');
    process.exit(1);
  }

  const filePath = path.join(process.cwd(), 'oracoes_completas_final.txt');
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Arquivo não encontrado: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentCategory = 'Provação'; // Fallback
  let currentImageUrl = null;
  const prayersToInsert = [];
  let currentTitle = null;
  let currentContent = [];

  const imageMap = {
    'ORAÇÕES DA MANHÃ': 'https://lmcedwslucgzsonqtexs.supabase.co/storage/v1/object/public/prayers-images/default_themes/morning.png',
    'ORAÇÕES DA NOITE': 'https://lmcedwslucgzsonqtexs.supabase.co/storage/v1/object/public/prayers-images/default_themes/night.png',
    'ANSIEDADE E MEDO': 'https://lmcedwslucgzsonqtexs.supabase.co/storage/v1/object/public/prayers-images/default_themes/anxiety.png',
    'FAMÍLIA': 'https://lmcedwslucgzsonqtexs.supabase.co/storage/v1/object/public/prayers-images/default_themes/family.png',
    'FÉ E CONFIANÇA': 'https://lmcedwslucgzsonqtexs.supabase.co/storage/v1/object/public/prayers-images/default_themes/faith.png'
  };

  // Mapeamento de cabeçalho para ENUM do Banco ('Ansiedade', 'Família', 'Prosperidade', 'Provação')
  const themeMap = {
    'ORAÇÕES DA MANHÃ': 'Provação',
    'ORAÇÕES DA NOITE': 'Ansiedade',
    'ANSIEDADE E MEDO': 'Ansiedade',
    'FAMÍLIA': 'Família',
    'FÉ E CONFIANÇA': 'Provação'
  };

  const saveCurrentPrayer = () => {
    if (currentTitle && currentContent.length > 0) {
      prayersToInsert.push({
        user_id: userId,
        title: currentTitle.trim(),
        theme: currentCategory,
        content: currentContent.join('\n').trim(),
        image_url: currentImageUrl,
        duration: 0
      });
      currentContent = [];
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.match(/^={3,}$/)) continue;

    // Detecta Categoria
    // Tem emojis ou é em UPPERCASE. Ex: "🌅 ORAÇÕES DA MANHÃ"
    const catMatch = trimmedLine.match(/^[^A-ZÀ-Ú]*([A-ZÀ-Ú\s\/]+)(?:\s*\(.+\))?$/);
    if (catMatch && (trimmedLine.includes('ORAÇÕES') || trimmedLine.includes('ANSIEDADE') || trimmedLine.includes('FAMÍLIA') || trimmedLine.includes('CONFIANÇA'))) {
      saveCurrentPrayer(); // Salva a anterior antes de mudar categoria
      const catText = catMatch[1].trim();
      currentCategory = themeMap[catText] || 'Provação';
      currentImageUrl = imageMap[catText] || null;
      console.log(`📂 Categoria Encontrada: [${catText}] -> Mapeada para: ${currentCategory}`);
      currentTitle = null;
      continue;
    }

    // Detecta Título: Ex: "1. Entregando o dia a Deus"
    const titleMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (titleMatch) {
      saveCurrentPrayer(); // Salva a anterior
      currentTitle = titleMatch[1].trim();
      continue;
    }

    // Se tiver título e não for vazio, acumula conteúdo
    if (currentTitle && trimmedLine) {
      currentContent.push(trimmedLine);
    }
  }

  // Salva a última oração do loop
  saveCurrentPrayer();

  console.log(`📊 total de orações para inserir: ${prayersToInsert.length}`);

  if (prayersToInsert.length === 0) {
    console.log('Nenhuma oração processada.');
    return;
  }

  // Insere em lotes
  const batchSize = 10;
  for (let i = 0; i < prayersToInsert.length; i += batchSize) {
    const batch = prayersToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('original_prayers').insert(batch);
    if (error) {
      console.error(`❌ Erro ao inserir lote ${i / batchSize + 1}:`, error.message);
      return;
    }
    console.log(`✅ Lote ${i / batchSize + 1} inserido (${batch.length} itens)`);
  }

  console.log('🎉 Todas as orações foram inseridas com sucesso para o usuário!');
}

main().catch(console.error);

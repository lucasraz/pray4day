import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const images = [
  { name: 'morning_prayer_setup_1774302013943.png', theme: 'ORAÇÕES DA MANHÃ' },
  { name: 'night_prayer_setup_1774302027508.png', theme: 'ORAÇÕES DA NOITE' },
  { name: 'anxiety_prayer_setup_1774302042506.png', theme: 'ANSIEDADE E MEDO' },
  { name: 'family_prayer_setup_1774302056794.png', theme: 'FAMÍLIA' },
  { name: 'faith_prayer_setup_1774302072443.png', theme: 'FÉ E CONFIANÇA' }
];

async function upload() {
  const urlMap = {};

  for (const img of images) {
    const filePath = path.join('C:', 'Users', 'luc_r', '.gemini', 'antigravity', 'brain', 'd5447b98-aa2c-4600-a457-0a3652842476', img.name);
    
    if (!fs.existsSync(filePath)) {
       console.error(`File not found: ${filePath}`);
       continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const fileName = `default_themes/${img.name.split('_')[0]}.png`;

    const { data, error } = await s.storage
      .from('prayers-images')
      .upload(fileName, fileBuffer, { upsert: true, contentType: 'image/png' });

    if (error) {
       console.error(`Error uploading ${img.theme}:`, error.message);
    } else {
       const { data: urlData } = s.storage.from('prayers-images').getPublicUrl(fileName);
       urlMap[img.theme] = urlData.publicUrl;
       console.log(`✅ Uploaded ${img.theme}: ${urlData.publicUrl}`);
    }
  }

  console.log('\n--- MAPA DE URLS ---');
  console.log(JSON.stringify(urlMap, null, 2));
}

upload().catch(console.error);

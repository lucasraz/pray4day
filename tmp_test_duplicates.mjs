import fs from 'fs'

const content = fs.readFileSync('versiculos_biblicos_completos.txt', 'utf-8')
const lines = content.split('\n')

const refs = []
const duplicates = []

for (const line of lines) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('---')) continue
  
  const parts = trimmed.split(': ')
  if (parts.length >= 2) {
    const ref = parts[0].trim()
    if (refs.includes(ref)) {
      duplicates.push(ref)
    } else {
      refs.push(ref)
    }
  }
}

console.log(`📊 Total Únicos: ${refs.length}`)
console.log(`⚠️ Duplicados:`, duplicates)
if (duplicates.length === 0) console.log('✅ Nenhum versículo duplicado no arquivo!')

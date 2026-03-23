'use client'
import { useState, useRef } from 'react';
import { ChevronLeft, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import Link from 'next/link';
import { createPrayerChainAction } from '../actions';

interface PredefinedPrayer {
  id: string;
  name: string;
  category: string;
  content: string;
}

interface SelectedItem {
  id: string; // uuid for list key
  predefined_prayer_id?: string;
  custom_prayer_name?: string;
  custom_prayer_text?: string;
  prayer_name: string; // display name
  prayer_content?: string; // for preview
  quantity: number;
}

const DAYS = [
  { key: 'mon', label: 'Seg' }, { key: 'tue', label: 'Ter' }, { key: 'wed', label: 'Qua' },
  { key: 'thu', label: 'Qui' }, { key: 'fri', label: 'Sex' }, { key: 'sat', label: 'Sáb' }, { key: 'sun', label: 'Dom' },
];

const CATEGORIES = ['Geral', 'Saúde', 'Família', 'Proteção', 'Fé', 'Gratidão', 'Direção', 'Trabalho'];

export default function CreatePrayerChainForm({ prayers }: { prayers: PredefinedPrayer[] }) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [isDaily, setIsDaily] = useState(true);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [expandedPrayerId, setExpandedPrayerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customText, setCustomText] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Agrupando por categoria
  const grouped = prayers.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {} as Record<string, PredefinedPrayer[]>);

  const filtered = searchQuery
    ? prayers.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const togglePrayer = (prayer: PredefinedPrayer) => {
    const exists = selectedItems.find(i => i.predefined_prayer_id === prayer.id);
    if (exists) {
      setSelectedItems(prev => prev.filter(i => i.predefined_prayer_id !== prayer.id));
    } else {
      setSelectedItems(prev => [...prev, {
        id: crypto.randomUUID(),
        predefined_prayer_id: prayer.id,
        prayer_name: prayer.name,
        prayer_content: prayer.content,
        quantity: 1,
      }]);
    }
  };

  const addCustomPrayer = () => {
    if (!customName.trim()) return;
    setSelectedItems(prev => [...prev, {
      id: crypto.randomUUID(),
      custom_prayer_name: customName.trim(),
      custom_prayer_text: customText.trim(),
      prayer_name: customName.trim(),
      prayer_content: customText.trim(),
      quantity: 1,
    }]);
    setCustomName('');
    setCustomText('');
    setShowCustomForm(false);
  };

  const updateQuantity = (id: string, qty: number) => {
    setSelectedItems(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(1, qty) } : i));
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(i => i.id !== id));
  };

  const periodicity = isDaily ? ['daily'] : selectedDays;

  const handleSubmit = async (formData: FormData) => {
    formData.set('periodicity', JSON.stringify(periodicity));
    formData.set('items', JSON.stringify(
      selectedItems.map((item, idx) => ({
        predefined_prayer_id: item.predefined_prayer_id,
        custom_prayer_name: item.custom_prayer_name,
        custom_prayer_text: item.custom_prayer_text,
        quantity: item.quantity,
        order_index: idx,
      }))
    ));
    await createPrayerChainAction(formData);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf9f5] pb-32">
      {/* Header */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 sticky top-0 z-20 shadow-sm border-b border-[#e4e2de]/40">
        <Link href="/dashboard/prayer-chains" className="p-2 -ml-2 rounded-xl text-[#1b1c1a] hover:bg-[#e4e2de]/20 transition-all">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <span className="font-display font-medium text-lg text-[#042418]">Nova Corrente</span>
        <div className="w-10" />
      </div>

      <form ref={formRef} action={handleSubmit} className="flex flex-col gap-6 p-5 max-w-md mx-auto w-full">

        {/* Título */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-sans font-bold text-[#042418]">Título da Corrente</label>
          <input name="title" type="text" required placeholder="Ex: Corrente pela cura de Maria..." className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
        </div>

        {/* Propósito */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-sans font-bold text-[#042418]">Propósito <span className="text-[#727974] font-normal">(Opcional)</span></label>
          <textarea name="purpose" rows={3} placeholder="Descreva o motivo desta corrente de oração..." className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans resize-none focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
        </div>

        {/* Categoria */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-sans font-bold text-[#042418]">Categoria</label>
          <select name="category" defaultValue="Geral" className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all appearance-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Datas */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-sans font-bold text-[#042418]">Início</label>
            <input name="start_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-white border border-[#e4e2de] rounded-xl px-3 py-3 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
          </div>
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="text-sm font-sans font-bold text-[#042418]">Fim <span className="text-[#727974] font-normal">(Opcional)</span></label>
            <input name="end_date" type="date" className="w-full bg-white border border-[#e4e2de] rounded-xl px-3 py-3 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
          </div>
        </div>

        {/* Horário */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-sans font-bold text-[#042418]">Horário das Orações</label>
          <input name="execution_time" type="time" required defaultValue="07:00" className="w-full bg-white border border-[#e4e2de] rounded-xl px-4 py-3 text-sm font-sans focus:outline-none focus:border-[#775a19] focus:ring-1 focus:ring-[#775a19] transition-all" />
        </div>

        {/* Periodicidade */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-sans font-bold text-[#042418]">Periodicidade</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsDaily(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold border transition-all ${isDaily ? 'bg-[#042418] text-white border-[#042418]' : 'bg-white text-[#727974] border-[#e4e2de]'}`}>
              Todo dia
            </button>
            <button type="button" onClick={() => setIsDaily(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-sans font-bold border transition-all ${!isDaily ? 'bg-[#042418] text-white border-[#042418]' : 'bg-white text-[#727974] border-[#e4e2de]'}`}>
              Dias específicos
            </button>
          </div>
          {!isDaily && (
            <div className="grid grid-cols-7 gap-1 mt-1">
              {DAYS.map(day => (
                <button key={day.key} type="button"
                  onClick={() => setSelectedDays(prev =>
                    prev.includes(day.key) ? prev.filter(d => d !== day.key) : [...prev, day.key]
                  )}
                  className={`py-2.5 rounded-xl text-xs font-sans font-bold border transition-all ${selectedDays.includes(day.key) ? 'bg-[#775a19] text-white border-[#775a19]' : 'bg-white text-[#727974] border-[#e4e2de]'}`}>
                  {day.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Orações Selecionadas */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-sans font-bold text-[#042418]">Orações da Corrente</label>

          {selectedItems.length > 0 && (
            <div className="flex flex-col gap-2 mb-2">
              {selectedItems.map((item) => (
                <div key={item.id} className="bg-white border border-[#e4e2de] rounded-2xl overflow-hidden">
                  <div className="flex items-center gap-3 p-3">
                    <button type="button" onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                      className="flex-1 flex items-center gap-2 text-left">
                      <span className="text-sm font-sans font-bold text-[#042418] flex-1">{item.prayer_name}</span>
                      {expandedItemId === item.id ? <ChevronUp className="w-4 h-4 text-[#727974]" /> : <ChevronDown className="w-4 h-4 text-[#727974]" />}
                    </button>
                    <div className="flex items-center gap-1.5 border border-[#e4e2de] rounded-lg overflow-hidden">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 text-[#727974] hover:bg-[#f5f3ef] transition-all text-sm font-bold">−</button>
                      <span className="px-2 text-sm font-sans font-bold text-[#042418] min-w-[24px] text-center">{item.quantity}x</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 text-[#727974] hover:bg-[#f5f3ef] transition-all text-sm font-bold">+</button>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ffe4e4] transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {expandedItemId === item.id && item.prayer_content && (
                    <div className="px-4 pb-4 border-t border-[#e4e2de]/50 bg-[#fbf9f5]">
                      <p className="text-[#1b1c1a] font-sans text-sm leading-relaxed italic pt-3 whitespace-pre-wrap">{item.prayer_content}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Buscador de orações */}
          <div className="bg-white border border-[#e4e2de] rounded-2xl overflow-hidden">
            <div className="p-3 border-b border-[#e4e2de]/50">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Buscar oração..." className="w-full text-sm font-sans bg-transparent focus:outline-none text-[#1b1c1a] placeholder:text-[#727974]" />
            </div>

            <div className="max-h-52 overflow-y-auto">
              {(filtered || Object.values(grouped).flat()).map(prayer => {
                const isSelected = selectedItems.some(i => i.predefined_prayer_id === prayer.id);
                return (
                  <div key={prayer.id}>
                    <button type="button" onClick={() => togglePrayer(prayer)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-[#e4e2de]/30 transition-all hover:bg-[#f5f3ef] ${isSelected ? 'bg-[#e6f4ec]' : ''}`}>
                      <div>
                        <span className="text-sm font-sans font-bold text-[#042418] block">{prayer.name}</span>
                        {!filtered && <span className="text-[10px] text-[#727974] font-sans">{prayer.category}</span>}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-[#2e7d52] flex-shrink-0" />}
                    </button>
                    {expandedPrayerId === prayer.id && (
                      <div className="px-4 py-3 bg-[#fbf9f5] border-b border-[#e4e2de]/30">
                        <p className="text-sm font-sans text-[#1b1c1a] leading-relaxed italic whitespace-pre-wrap">{prayer.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Oração personalizada */}
          {!showCustomForm ? (
            <button type="button" onClick={() => setShowCustomForm(true)}
              className="flex items-center gap-2 text-[#775a19] text-sm font-sans font-bold py-2 hover:text-[#042418] transition-all">
              <Plus className="w-4 h-4" /> Escrever oração personalizada
            </button>
          ) : (
            <div className="bg-white border border-[#e4e2de] rounded-2xl p-4 flex flex-col gap-3">
              <input type="text" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Nome da oração..." className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans focus:outline-none focus:border-[#775a19] transition-all" />
              <textarea value={customText} onChange={e => setCustomText(e.target.value)} rows={4} placeholder="Escreva o texto da oração..." className="w-full bg-[#f5f3ef] border border-[#e4e2de] rounded-xl px-3 py-2.5 text-sm font-sans resize-none focus:outline-none focus:border-[#775a19] transition-all" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCustomForm(false)} className="flex-1 py-2 rounded-xl text-sm font-san font-bold text-[#727974] border border-[#e4e2de] hover:bg-[#f5f3ef] transition-all">Cancelar</button>
                <button type="button" onClick={addCustomPrayer} className="flex-1 py-2 rounded-xl text-sm font-sans font-bold bg-[#042418] text-white hover:bg-[#1b3a2c] transition-all">Adicionar</button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button type="submit"
          className="w-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] text-white font-sans font-bold text-base py-4 rounded-2xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all mt-2">
          CRIAR CORRENTE DE ORAÇÃO
        </button>
      </form>
    </div>
  );
}

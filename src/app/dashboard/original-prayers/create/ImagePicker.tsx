'use client'
import { useState, useRef } from 'react';
import { Camera, X, ImagePlus } from 'lucide-react';

export default function ImagePicker({ disabled }: { disabled?: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3.5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 3.5MB para evitar falhas de rede');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-sans font-bold text-[#042418] flex items-center gap-2">
        <Camera className="w-4 h-4 text-[#775a19]" /> Imagem de Capa
      </label>

      {preview ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#e4e2de] shadow-sm bg-[#f5f3ef]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-all"
            disabled={disabled}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="imageFile"
          className={`flex flex-col items-center justify-center gap-2 w-full aspect-video rounded-xl border-2 border-dashed border-[#e4e2de] bg-white hover:bg-[#fbf9f5] hover:border-[#775a19]/40 cursor-pointer transition-all ${
            disabled ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <div className="p-3 bg-[#f5f3ef] rounded-full">
            <ImagePlus className="w-5 h-5 text-[#775a19]" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs font-sans font-bold text-[#042418]">Carregar Imagem</span>
            <span className="text-[10px] text-[#727974] font-sans">JPG, PNG até 5MB</span>
          </div>
        </label>
      )}

      <input
        ref={fileInputRef}
        type="file"
        id="imageFile"
        name="imageFile"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

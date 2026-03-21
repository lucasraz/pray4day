'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2 } from 'lucide-react';

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);

        // Attach to hidden file input so it can be sent via Server Action
        if (fileInputRef.current) {
          const file = new File([audioBlob], 'prayer-audio.webm', { type: 'audio/webm' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInputRef.current.files = dataTransfer.files;
        }

        // Parar os tracks para liberar o microfone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Permissão de microfone negada ou indisponível.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const deleteRecording = () => {
    setAudioURL(null);
    setRecordingTime(0);
    audioChunksRef.current = [];
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-sans font-bold text-[#042418]">Oração em Áudio (Opcional)</label>
      
      {/* Hidden input to hold the actual File for FormData submission */}
      <input type="file" name="audioFile" ref={fileInputRef} className="hidden" accept="audio/*" />

      {!audioURL ? (
        <div className="flex items-center gap-4 bg-[#f0eeea] border border-[#e4e2de]/60 rounded-xl p-4">
          {isRecording ? (
            <button 
              type="button" 
              onClick={stopRecording}
              className="w-12 h-12 rounded-full bg-[#ba1a1a] flex justify-center items-center shadow-md animate-pulse"
            >
              <Square className="w-5 h-5 fill-white text-white" />
            </button>
          ) : (
            <button 
              type="button" 
              onClick={startRecording}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-[#042418] to-[#1b3a2c] flex justify-center items-center shadow-md hover:scale-105 transition-all"
            >
              <Mic className="w-5 h-5 text-white" />
            </button>
          )}

          <div className="flex flex-col flex-1">
            <span className="font-sans font-bold text-sm text-[#042418]">
              {isRecording ? 'Gravando Oração...' : 'Toque para gravar'}
            </span>
            <span className="font-sans text-xs text-[#727974]">
              {isRecording ? formatTime(recordingTime) : 'Até 2 minutos de bênçãos'}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-[#f5f3ef] border border-[#e4e2de]/60 rounded-xl p-4">
          <audio src={audioURL} controls className="h-10 w-full flex-1" />
          <button 
            type="button" 
            onClick={deleteRecording}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-[#ffe4e4] text-[#727974] hover:text-[#ba1a1a] transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

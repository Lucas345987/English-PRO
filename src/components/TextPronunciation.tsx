import React, { useState, useEffect } from 'react';
import { Volume2, Loader2, BookOpen, RefreshCw } from 'lucide-react';
import { getPronunciationAndMeaning, PronunciationResult, generateSpeech } from '../services/geminiService';

let audioCtx: AudioContext | null = null;

export default function TextPronunciation() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

  const GOOGLE_TRANSLATE_VOICE_URI = 'google-ai-voice-online';

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      // Prioritize English voices
      const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
      const voicesToUse = englishVoices.length > 0 ? englishVoices : availableVoices;
      
      const customGoogleVoice = {
        voiceURI: GOOGLE_TRANSLATE_VOICE_URI,
        name: 'Google AI Voice (Online)',
        lang: 'en-US',
        localService: false,
        default: false,
      } as SpeechSynthesisVoice;

      const allVoices = [customGoogleVoice, ...voicesToUse];
      setVoices(allVoices);
      
      if (!selectedVoiceURI) {
        setSelectedVoiceURI(GOOGLE_TRANSLATE_VOICE_URI);
      }
    };

    loadVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleReadAloud = async () => {
    if (!text.trim()) return;

    if (selectedVoiceURI === GOOGLE_TRANSLATE_VOICE_URI) {
      setLoading(true);
      setError(null);
      try {
        const base64Audio = await generateSpeech(text);
        
        if (!audioCtx) {
          audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const buffer = new Int16Array(bytes.buffer);
        const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
          channelData[i] = buffer[i] / 32768.0;
        }
        
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      } catch (err) {
        console.error("Failed to play AI audio:", err);
        setError("Não foi possível gerar a voz online. Tente outra voz na lista.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    const selectedVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getPronunciationAndMeaning(text);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('Falha ao analisar o texto. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Aprender Palavras e Frases</h2>
        <p className="text-slate-500">Digite uma palavra ou frase em inglês para ouvi-la e ver seu significado.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <textarea
            className="w-full h-32 p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-shadow"
            placeholder="Digite uma palavra ou frase em inglês aqui..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div className="p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleReadAloud}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shrink-0"
            >
              <Volume2 className="w-5 h-5" />
              Ouvir
            </button>
            
            {voices.length > 0 && (
              <select
                className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-3 focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:max-w-[200px] truncate"
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                title="Selecionar voz"
              >
                {voices.map((voice, index) => (
                  <option key={`${voice.voiceURI}-${index}`} value={voice.voiceURI}>
                    {voice.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || loading}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm w-full sm:w-auto justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BookOpen className="w-5 h-5" />}
            Analisar Significado
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Palavra / Frase</h3>
            <p className="text-2xl font-bold text-slate-900">{result.text}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Pronúncia (IPA)</h3>
            <div className="flex items-center gap-3">
              <p className="text-xl font-mono text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg inline-block">{result.ipa}</p>
              <button 
                onClick={handleReadAloud}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                title="Repetir pronúncia"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Significado</h3>
            <p className="text-lg text-slate-700 leading-relaxed">{result.meaning}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Exemplos</h3>
            <ul className="space-y-3">
              {result.examples.map((example, idx) => (
                <li key={idx} className="flex gap-3 text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span className="leading-relaxed">{example}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { translateText } from '../services/geminiService';

export default function Translator() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await translateText(inputText);
      setTranslatedText(result);
    } catch (err) {
      console.error(err);
      setError("Ocorreu um erro ao traduzir o texto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-2">
          <Languages className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Tradutor</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Traduza textos do Inglês para o Português rapidamente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Inglês</label>
          <textarea
            className="w-full h-48 p-4 text-lg bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-sm"
            placeholder="Digite o texto em inglês aqui..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={handleTranslate}
            disabled={loading || !inputText.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Traduzindo...</>
            ) : (
              <><Languages className="w-5 h-5" /> Traduzir</>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-700">Português</label>
          <div className={`w-full h-48 p-4 text-lg rounded-xl border shadow-sm overflow-y-auto ${translatedText ? 'bg-indigo-50 border-indigo-100 text-slate-800' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
            {translatedText || 'A tradução aparecerá aqui...'}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

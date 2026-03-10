import React, { useState } from 'react';
import { generateQuestions, QuizQuestion } from '../services/geminiService';
import { Loader2, CheckCircle2, XCircle, RefreshCw, BrainCircuit } from 'lucide-react';

export default function PracticeQuestions() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Básico');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
    setTypedAnswer('');

    try {
      const data = await generateQuestions(topic, level);
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar perguntas. Por favor, tente outro tópico.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Prevent multiple clicks
    setSelectedAnswer(answer);
    
    const correct = questions[currentQuestionIdx].correctAnswer;
    if (answer.trim().toLowerCase() === correct.trim().toLowerCase()) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedAnswer(null);
      setTypedAnswer('');
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setTopic('');
    setQuizFinished(false);
    setCurrentQuestionIdx(0);
    setSelectedAnswer(null);
    setTypedAnswer('');
    setScore(0);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Praticar por Tópico</h2>
        <p className="text-slate-500">Digite um tópico que você deseja praticar (ex: "Viagem", "Negócios", "Comida").</p>
      </div>

      {!questions.length && !loading && !quizFinished && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="space-y-4">
            <label htmlFor="topic" className="block text-sm font-medium text-slate-700">
              Tópico
            </label>
            <input
              id="topic"
              type="text"
              className="w-full p-4 text-lg bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
              placeholder="ex: Pedir comida em um restaurante"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">Nível de Dificuldade</label>
            <div className="flex flex-wrap gap-3">
              {['Básico', 'Intermediário', 'Avançado'].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-5 py-3 rounded-xl font-medium transition-all duration-200 flex-1 sm:flex-none ${
                    level === l 
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200 border-2 shadow-sm' 
                      : 'bg-white text-slate-600 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!topic.trim() || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
          >
            <BrainCircuit className="w-5 h-5" />
            Gerar Quiz
          </button>
          
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 text-slate-500 animate-in fade-in duration-500">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
          <p className="font-medium">Gerando seu quiz personalizado...</p>
        </div>
      )}

      {questions.length > 0 && !quizFinished && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Pergunta {currentQuestionIdx + 1} de {questions.length}
            </span>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Pontuação: {score}
            </span>
          </div>
          
          <div className="p-8 space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">
              {questions[currentQuestionIdx].question}
            </h3>
            
            {questions[currentQuestionIdx].type === 'multiple_choice' ? (
              <div className="space-y-3">
                {questions[currentQuestionIdx].options?.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === questions[currentQuestionIdx].correctAnswer;
                  const showCorrect = selectedAnswer && isCorrect;
                  const showIncorrect = isSelected && !isCorrect;
                  
                  let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium text-lg ";
                  
                  if (!selectedAnswer) {
                    btnClass += "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700";
                  } else if (showCorrect) {
                    btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
                  } else if (showIncorrect) {
                    btnClass += "border-red-500 bg-red-50 text-red-800";
                  } else {
                    btnClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-50";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={btnClass}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {showCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                        {showIncorrect && <XCircle className="w-6 h-6 text-red-500" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  className={`w-full p-4 text-lg border-2 rounded-xl focus:outline-none transition-colors ${
                    selectedAnswer
                      ? selectedAnswer.trim().toLowerCase() === questions[currentQuestionIdx].correctAnswer.trim().toLowerCase()
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-red-500 bg-red-50 text-red-800'
                      : 'bg-white border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                  }`}
                  placeholder="Digite sua resposta..."
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  disabled={!!selectedAnswer}
                  onKeyDown={(e) => e.key === 'Enter' && !selectedAnswer && typedAnswer.trim() && handleAnswer(typedAnswer)}
                />
                {!selectedAnswer && (
                  <button
                    onClick={() => handleAnswer(typedAnswer)}
                    disabled={!typedAnswer.trim()}
                    className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
                  >
                    Confirmar Resposta
                  </button>
                )}
              </div>
            )}
            
            {selectedAnswer && (
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  {selectedAnswer.trim().toLowerCase() === questions[currentQuestionIdx].correctAnswer.trim().toLowerCase() ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-5 h-5"/> Correto!</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1"><XCircle className="w-5 h-5"/> Incorreto</span>
                  )}
                </h4>
                {selectedAnswer.trim().toLowerCase() !== questions[currentQuestionIdx].correctAnswer.trim().toLowerCase() && (
                  <p className="text-slate-700 mb-4">
                    <span className="font-medium">Resposta correta:</span> {questions[currentQuestionIdx].correctAnswer}
                  </p>
                )}
                <p className="text-slate-700 leading-relaxed">{questions[currentQuestionIdx].explanation}</p>
                
                <button
                  onClick={handleNext}
                  className="mt-6 w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-sm"
                >
                  {currentQuestionIdx < questions.length - 1 ? 'Próxima Pergunta' : 'Finalizar Quiz'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {quizFinished && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl font-bold">{score}/{questions.length}</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">Quiz Concluído!</h3>
          <p className="text-lg text-slate-500 max-w-md mx-auto">
            Você acertou {score} de {questions.length} no tópico "{topic}". Continue praticando para melhorar seu inglês!
          </p>
          
          <button
            onClick={handleRestart}
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            <RefreshCw className="w-5 h-5" />
            Tentar Outro Tópico
          </button>
        </div>
      )}
    </div>
  );
}

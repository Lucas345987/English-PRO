import React, { useState } from 'react';
import { BookA, GraduationCap, Menu, X, Languages } from 'lucide-react';
import TextPronunciation from './components/TextPronunciation';
import PracticeQuestions from './components/PracticeQuestions';
import Translator from './components/Translator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'text' | 'practice' | 'translator'>('text');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'text', label: 'Aprender Palavras', icon: BookA },
    { id: 'practice', label: 'Praticar Tópico', icon: GraduationCap },
    { id: 'translator', label: 'Tradutor', icon: Languages },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
          <BookA className="w-6 h-6" />
          <span>EnglishPro</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <nav className={`
        fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-8 z-10
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center gap-3 text-indigo-600 font-bold text-2xl tracking-tight px-2">
          <div className="bg-indigo-50 p-2 rounded-xl">
            <BookA className="w-7 h-7" />
          </div>
          <span>EnglishPro</span>
        </div>

        <div className="flex flex-col gap-2 mt-8 md:mt-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-left w-full
                  ${isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'}
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
        
        <div className="mt-auto p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-500 leading-relaxed">
            Domine a pronúncia em inglês e teste seus conhecimentos com quizzes gerados por IA.
          </p>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
          {activeTab === 'text' && <TextPronunciation />}
          {activeTab === 'practice' && <PracticeQuestions />}
          {activeTab === 'translator' && <Translator />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-0 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}

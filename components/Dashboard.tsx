
import React, { useState } from 'react';
import type { FinancialKPI, Event } from '../types';
import { SparklesIcon } from './icons';
import { extractProposalFromText } from '../services/geminiService';

interface DashboardProps {
  kpis: FinancialKPI[];
  events: Event[];
  onEventClick: (event: Event) => void;
  onMagicCreate: (data: any) => void;
  privacyMode: boolean;
}

const KPICard: React.FC<{ kpi: FinancialKPI; privacyMode: boolean }> = ({ kpi, privacyMode }) => {
  const changeColor = kpi.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-300">
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{kpi.label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {privacyMode && kpi.value.includes('R$') ? 'R$ ****' : kpi.value}
      </p>
      {kpi.change && <p className={`text-xs font-semibold mt-1 ${changeColor}`}>{kpi.change}</p>}
    </div>
  );
};

const EventItem: React.FC<{event: Event; onClick: () => void}> = ({ event, onClick }) => {
  const typeColors = {
    'DJ': 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    'Fotografia': 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    'Decoração': 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  }
  return (
    <li 
        onClick={onClick}
        className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg mb-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-gray-600 shadow-sm"
    >
      <div>
        <p className="font-bold text-gray-900 dark:text-white text-sm">{event.title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</p>
      </div>
      <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide border ${typeColors[event.type as keyof typeof typeColors] || 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}>{event.type}</span>
    </li>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ kpis, events, onEventClick, onMagicCreate, privacyMode }) => {
  const [magicInput, setMagicInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMagicSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!magicInput.trim()) return;

      setIsProcessing(true);
      try {
          const data = await extractProposalFromText(magicInput);
          onMagicCreate(data);
          setMagicInput('');
      } catch (error) {
          console.error(error);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="space-y-6">
      {/* Magic Input Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-900 dark:to-purple-900 p-0.5 rounded-xl shadow-lg relative overflow-hidden">
          <div className="bg-white dark:bg-gray-900/90 p-5 rounded-[10px] backdrop-blur-sm relative z-10">
              <div className="flex items-center mb-3 text-indigo-600 dark:text-indigo-300">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  <h2 className="font-bold text-lg">Recebeu um pedido no Zap?</h2>
              </div>
              <form onSubmit={handleMagicSubmit}>
                  <textarea
                      value={magicInput}
                      onChange={(e) => setMagicInput(e.target.value)}
                      placeholder="Cole aqui a mensagem... (ex: 'Oi, sou a Carol, queria orçamento de DJ pro meu casamento dia 20/11')"
                      className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm mb-3 resize-none h-20 placeholder-gray-400 dark:placeholder-gray-500 transition-colors shadow-inner"
                  />
                  <button 
                    type="submit" 
                    disabled={isProcessing || !magicInput}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 text-white font-bold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center shadow-md active:scale-95"
                  >
                      {isProcessing ? (
                          <span className="animate-pulse text-sm">Processando com IA...</span>
                      ) : (
                          <>
                            <SparklesIcon className="w-4 h-4 mr-2" />
                            <span className="text-sm">Criar Proposta Mágica</span>
                          </>
                      )}
                  </button>
              </form>
          </div>
          {/* Decorative bg elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl"></div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white px-1">Visão Geral Financeira</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpis.map(kpi => <KPICard key={kpi.label} kpi={kpi} privacyMode={privacyMode} />)}
        </div>
      </section>
      
      <section>
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white px-1">Próximos Eventos</h2>
        <ul className="space-y-3">
          {events.slice(0, 4).map(event => (
            <EventItem key={event.id} event={event} onClick={() => onEventClick(event)} />
          ))}
          {events.length === 0 && (
              <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum evento próximo.</p>
              </div>
          )}
        </ul>
      </section>
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { Transaction, MonthlyMetric, BusinessProfile } from '../types';
import { TrendingUpIcon, ChartBarIcon, ChevronLeftIcon } from './icons';

interface AnalyticsProps {
  transactions: Transaction[];
  historicalData: MonthlyMetric[];
  profile: BusinessProfile;
  onUpdateGoal: (amount: number) => void;
  onClose: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ transactions, historicalData, profile, onUpdateGoal, onClose }) => {
  const [goalInput, setGoalInput] = useState(profile.monthlyGoal?.toString() || '10000');
  const [isEditingGoal, setIsEditingGoal] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Calculate current month metrics
  const currentMonth = new Date().getMonth();
  const currentMonthTransactions = transactions.filter(t => new Date(t.date).getMonth() === currentMonth);
  
  const realizedRevenue = currentMonthTransactions
    .filter(t => t.status === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const pendingRevenue = currentMonthTransactions
    .filter(t => t.status === 'pending' || t.status === 'overdue')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const projectedRevenue = realizedRevenue + pendingRevenue;
  const goal = profile.monthlyGoal || 10000;
  const progressPercent = Math.min((realizedRevenue / goal) * 100, 100);
  const projectedPercent = Math.min((projectedRevenue / goal) * 100, 100);

  const maxHistorical = Math.max(...historicalData.map(d => d.revenue)) || 1;

  const handleSaveGoal = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateGoal(parseFloat(goalInput));
      setIsEditingGoal(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">
       <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <button onClick={onClose} className="text-gray-300 hover:text-white p-2 -ml-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white flex items-center">
            <ChartBarIcon className="w-5 h-5 mr-2 text-indigo-400" />
            Relatórios & Metas
        </h2>
        <div className="w-10"></div> 
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-6">
        
        {/* Goal Section */}
        <section className="bg-gray-800 rounded-xl p-5 shadow-md border border-gray-700">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Meta Mensal</h3>
                    {isEditingGoal ? (
                        <form onSubmit={handleSaveGoal} className="flex items-center">
                            <span className="text-xl font-bold text-white mr-1">R$</span>
                            <input 
                                type="number" 
                                value={goalInput} 
                                onChange={e => setGoalInput(e.target.value)}
                                className="bg-gray-700 text-white p-1 rounded w-24 text-lg font-bold focus:outline-none border border-indigo-500"
                                autoFocus
                            />
                            <button type="submit" className="ml-2 text-xs bg-indigo-600 px-2 py-1 rounded text-white">OK</button>
                        </form>
                    ) : (
                        <div className="flex items-center cursor-pointer" onClick={() => setIsEditingGoal(true)}>
                            <span className="text-2xl font-bold text-white">{formatCurrency(goal)}</span>
                            <span className="ml-2 text-xs text-indigo-400 underline opacity-0 hover:opacity-100 transition-opacity">Editar</span>
                        </div>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Realizado</p>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(realizedRevenue)}</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-gray-700 rounded-full overflow-hidden mb-2">
                {/* Projected Shadow */}
                <div 
                    className="absolute top-0 left-0 h-full bg-indigo-500/30"
                    style={{ width: `${projectedPercent}%` }}
                ></div>
                {/* Realized */}
                <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>{Math.round(progressPercent)}% Concluído</span>
            </div>
            <p className="text-xs text-center mt-3 text-gray-500">
                Faltam <span className="text-white font-bold">{formatCurrency(Math.max(0, goal - realizedRevenue))}</span> para atingir sua meta.
            </p>
        </section>

        {/* Historical Chart */}
        <section className="bg-gray-800 rounded-xl p-5 shadow-md border border-gray-700">
            <h3 className="text-gray-300 font-bold mb-6 flex items-center">
                <TrendingUpIcon className="w-5 h-5 mr-2 text-green-400" />
                Evolução do Faturamento
            </h3>
            
            <div className="h-48 flex items-end justify-between space-x-2">
                {historicalData.map((data, index) => {
                    const heightPercent = (data.revenue / maxHistorical) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="w-full bg-gray-700 rounded-t-md relative h-full flex items-end overflow-hidden">
                                <div 
                                    className="w-full bg-indigo-500 hover:bg-indigo-400 transition-all duration-500 rounded-t-md group-hover:shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                                    style={{ height: `${heightPercent}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-1 rounded whitespace-nowrap z-10">
                                    {formatCurrency(data.revenue)}
                                </div>
                            </div>
                            <span className="text-xs text-gray-500 mt-2 font-medium">{data.month}</span>
                        </div>
                    );
                })}
            </div>
        </section>

        {/* Insights Card */}
        <section className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Ticket Médio</p>
                <p className="text-xl font-bold text-white">R$ 3.250</p>
            </div>
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <p className="text-xs text-gray-500 mb-1">Melhor Mês</p>
                <p className="text-xl font-bold text-white">Ago</p>
            </div>
        </section>

      </div>
    </div>
  );
};

export default Analytics;

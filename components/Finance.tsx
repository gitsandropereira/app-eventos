
import React, { useState, useMemo } from 'react';
import { Transaction, MonthlyMetric, BusinessProfile } from '../types';
import { CheckCircleIcon, XCircleIcon, ChartBarIcon, PrinterIcon, PlusIcon, ArrowTrendingDownIcon, ArrowTrendingUpIcon, TrashIcon, BanknotesIcon } from './icons';
import Analytics from './Analytics';
import ReceiptModal from './ReceiptModal';
import { formatDate } from '../utils/date';

interface FinanceProps {
    transactions: Transaction[];
    onUpdateStatus: (id: string, status: 'paid' | 'pending' | 'overdue') => void;
    onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
    onDeleteTransaction: (id: string) => void;
    historicalData?: MonthlyMetric[];
    businessProfile?: BusinessProfile;
    onUpdateGoal?: (amount: number) => void;
    privacyMode: boolean;
}

const Finance: React.FC<FinanceProps> = ({ transactions, onUpdateStatus, onAddTransaction, onDeleteTransaction, historicalData, businessProfile, onUpdateGoal, privacyMode }) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
    const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Transaction Form State
    const [newDesc, setNewDesc] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');
    const [newCategory, setNewCategory] = useState('');
    const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

    const formatCurrency = (value: number) => {
        if (privacyMode) return 'R$ ****';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // Filter by Month
    const monthlyTransactions = useMemo(() => {
        return transactions.filter(t => t.date.startsWith(currentMonth));
    }, [transactions, currentMonth]);

    // Calculations
    const totalIncome = monthlyTransactions
        .filter(t => t.type === 'income' && t.status === 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const totalExpense = monthlyTransactions
        .filter(t => t.type === 'expense' && t.status === 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const pendingIncome = monthlyTransactions
        .filter(t => t.type === 'income' && t.status !== 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0);
    
    const pendingExpense = monthlyTransactions
        .filter(t => t.type === 'expense' && t.status !== 'paid')
        .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;

    const filteredTransactions = monthlyTransactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'pending') return t.status === 'pending' || t.status === 'overdue';
        if (filter === 'paid') return t.status === 'paid';
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleAddTransaction = (e: React.FormEvent) => {
        e.preventDefault();
        if (newDesc && newAmount) {
            onAddTransaction({
                description: newDesc,
                clientName: newCategory, // Using clientName field for category storage in quick add
                amount: parseFloat(newAmount),
                date: newDate,
                status: newType === 'expense' ? 'paid' : 'pending', // Default status
                type: newType,
                category: newCategory
            });
            setIsModalOpen(false);
            setNewDesc('');
            setNewAmount('');
            setNewCategory('');
        }
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Tipo', 'Descricao', 'Categoria', 'Valor', 'Status'];
        const rows = transactions.map(t => [
            t.date,
            t.type === 'income' ? 'Receita' : 'Despesa',
            t.description,
            t.category || t.clientName,
            t.amount.toString(),
            t.status
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financeiro_mileventos.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (showAnalytics && historicalData && businessProfile && onUpdateGoal) {
        return (
            <Analytics 
                transactions={transactions} 
                historicalData={historicalData}
                profile={businessProfile}
                onUpdateGoal={onUpdateGoal}
                onClose={() => setShowAnalytics(false)}
            />
        );
    }

    return (
        <div className="pb-24 relative">
             {/* Header */}
             <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-50 dark:bg-gray-900 z-10 py-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fluxo de Caixa</h2>
                <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="text-xs text-gray-500 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm">CSV</button>
                    <button onClick={() => setShowAnalytics(true)} className="flex items-center text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-full shadow-md">
                        <ChartBarIcon className="w-4 h-4 mr-1" /> Relatórios
                    </button>
                </div>
            </div>

            {/* Month Selector */}
            <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6 flex items-center justify-between">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-2 uppercase">Período</span>
                <input 
                    type="month" 
                    value={currentMonth}
                    onChange={(e) => setCurrentMonth(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1.5 rounded-lg font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border-t-4 border-green-500 border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Entradas</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalIncome)}</p>
                    <p className="text-[10px] text-gray-400">+{formatCurrency(pendingIncome)} pend.</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-sm border-t-4 border-red-500 border border-gray-100 dark:border-gray-700">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-1">Saídas</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpense)}</p>
                    <p className="text-[10px] text-gray-400">+{formatCurrency(pendingExpense)} fut.</p>
                </div>
                <div className={`p-3 rounded-xl shadow-sm border-t-4 ${balance >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-600' : 'bg-red-50 dark:bg-red-900/20 border-red-600'}`}>
                    <p className="text-[10px] uppercase font-bold mb-1 opacity-70">Saldo</p>
                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {formatCurrency(balance)}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {['all', 'paid', 'pending'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors whitespace-nowrap border ${filter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700'}`}
                    >
                        {f === 'all' ? 'Todas' : f === 'paid' ? 'Baixadas' : 'Pendentes'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="space-y-3">
                {filteredTransactions.map(t => (
                    <div key={t.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center group relative overflow-hidden">
                        {/* Status Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${t.status === 'paid' ? (t.type === 'income' ? 'bg-green-500' : 'bg-red-500') : 'bg-yellow-400'}`}></div>
                        
                        <div className="flex items-center ml-2">
                            <div className={`p-2 rounded-full mr-3 ${t.type === 'income' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                                {t.type === 'income' ? <ArrowTrendingUpIcon className="w-4 h-4" /> : <ArrowTrendingDownIcon className="w-4 h-4" />}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{t.description}</p>
                                <p className="text-xs text-gray-500">{formatDate(t.date)} • {t.category || t.clientName}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className={`font-bold ${t.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                            </p>
                            
                            <div className="flex items-center justify-end gap-2 mt-2">
                                {t.status !== 'paid' && (
                                    <button onClick={() => onUpdateStatus(t.id, 'paid')} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-transform">
                                        Receber
                                    </button>
                                )}
                                {t.status === 'paid' && t.type === 'income' && (
                                     <button 
                                        onClick={() => setSelectedReceipt(t)} 
                                        className="flex items-center text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full font-bold shadow-sm active:scale-95 transition-transform"
                                     >
                                        <PrinterIcon className="w-3 h-3 mr-1.5"/>
                                        Ver Recibo
                                     </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <BanknotesIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">Nenhuma movimentação neste mês.</p>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 transition-transform hover:scale-105 active:scale-95 z-30"
            >
                <PlusIcon className="w-6 h-6" />
            </button>

            {/* New Transaction Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4 animate-in slide-in-from-bottom-10">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nova Movimentação</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircleIcon className="w-6 h-6"/></button>
                        </div>
                        
                        <form onSubmit={handleAddTransaction} className="space-y-4">
                            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button type="button" onClick={() => setNewType('income')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${newType === 'income' ? 'bg-white dark:bg-gray-600 text-green-600 shadow' : 'text-gray-500'}`}>Receita</button>
                                <button type="button" onClick={() => setNewType('expense')} className={`flex-1 py-2 rounded-md text-sm font-bold transition-colors ${newType === 'expense' ? 'bg-white dark:bg-gray-600 text-red-600 shadow' : 'text-gray-500'}`}>Despesa</button>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Valor</label>
                                <input type="number" required placeholder="0,00" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-xl font-bold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-gray-700" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Descrição</label>
                                <input type="text" required placeholder="Ex: Uber, Aluguel, Cliente X" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-gray-700" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Categoria</label>
                                    <input type="text" placeholder="Ex: Transporte" value={newCategory} onChange={e => setNewCategory(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-gray-700 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Data</label>
                                    <input type="date" required value={newDate} onChange={e => setNewDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 p-3 rounded-lg text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-gray-700 text-sm" />
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-4">
                                Confirmar
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {selectedReceipt && businessProfile && (
                <ReceiptModal transaction={selectedReceipt} businessProfile={businessProfile} onClose={() => setSelectedReceipt(null)} />
            )}
        </div>
    );
};

export default Finance;

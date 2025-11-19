
import React, { useState } from 'react';
import { Transaction, MonthlyMetric, BusinessProfile } from '../types';
import { CheckCircleIcon, XCircleIcon, ChartBarIcon, PrinterIcon } from './icons';
import Analytics from './Analytics';
import ReceiptModal from './ReceiptModal';
import { formatDate } from '../utils/date';

interface FinanceProps {
    transactions: Transaction[];
    onUpdateStatus: (id: string, status: 'paid' | 'pending' | 'overdue') => void;
    // Props for analytics
    historicalData?: MonthlyMetric[];
    businessProfile?: BusinessProfile;
    onUpdateGoal?: (amount: number) => void;
    privacyMode: boolean;
}

const Finance: React.FC<FinanceProps> = ({ transactions, onUpdateStatus, historicalData, businessProfile, onUpdateGoal, privacyMode }) => {
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState<Transaction | null>(null);

    const formatCurrency = (value: number) => {
        if (privacyMode) return 'R$ ****';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const totalPending = transactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((acc, curr) => acc + curr.amount, 0);
    const totalPaid = transactions.filter(t => t.status === 'paid').reduce((acc, curr) => acc + curr.amount, 0);

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'pending') return t.status === 'pending' || t.status === 'overdue';
        if (filter === 'paid') return t.status === 'paid';
        return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-200 dark:border-green-400/20';
            case 'pending': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
            case 'overdue': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
            default: return 'text-gray-500 dark:text-gray-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Recebido';
            case 'pending': return 'A Receber';
            case 'overdue': return 'Atrasado';
            default: return status;
        }
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Descricao', 'Cliente', 'Valor', 'Status'];
        const rows = transactions.map(t => [
            t.date,
            t.description,
            t.clientName,
            t.amount.toString(),
            getStatusLabel(t.status)
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

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
        <div className="pb-20">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Fluxo de Caixa</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-full transition-colors shadow-sm"
                        title="Exportar CSV"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        CSV
                    </button>
                    <button 
                        onClick={() => setShowAnalytics(true)}
                        className="flex items-center text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-full shadow-md transition-colors"
                    >
                        <ChartBarIcon className="w-4 h-4 mr-1" />
                        Relatórios
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-green-500 border-t border-r border-b border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-green-100 dark:bg-green-500/10 rounded-full blur-xl"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Recebido</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-yellow-500 border-t border-r border-b border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-yellow-100 dark:bg-yellow-500/10 rounded-full blur-xl"></div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">A Receber</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPending)}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                <button 
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                >
                    Todas
                </button>
                <button 
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${filter === 'pending' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                >
                    Pendentes
                </button>
                <button 
                    onClick={() => setFilter('paid')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap shadow-sm ${filter === 'paid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'}`}
                >
                    Recebidas
                </button>
            </div>

            {/* Transaction List */}
            <div className="space-y-3">
                {filteredTransactions.map(transaction => (
                    <div key={transaction.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-center group hover:border-indigo-200 dark:hover:border-gray-600 transition-all">
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-bold text-gray-900 dark:text-white">{transaction.description}</p>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getStatusColor(transaction.status)}`}>
                                    {getStatusLabel(transaction.status)}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{transaction.clientName}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(transaction.date)}</p>
                        </div>
                        
                        <div className="text-right ml-4 flex flex-col items-end space-y-2">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</p>
                            
                            <div className="flex space-x-2">
                                {transaction.status === 'paid' && (
                                     <button 
                                        onClick={() => setSelectedReceipt(transaction)}
                                        className="text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1.5 rounded flex items-center transition-colors"
                                        title="Gerar Recibo"
                                    >
                                        <PrinterIcon className="w-3 h-3 mr-1" />
                                        Recibo
                                    </button>
                                )}

                                {transaction.status === 'pending' || transaction.status === 'overdue' ? (
                                    <button 
                                        onClick={() => onUpdateStatus(transaction.id, 'paid')}
                                        className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded flex items-center transition-colors shadow-sm"
                                    >
                                        <CheckCircleIcon className="w-3 h-3 mr-1" />
                                        Baixar
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => onUpdateStatus(transaction.id, 'pending')}
                                        className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center opacity-50 hover:opacity-100 transition-opacity px-2"
                                    >
                                        Desfazer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {filteredTransactions.length === 0 && (
                    <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                        Nenhuma transação encontrada.
                    </div>
                )}
            </div>

            {selectedReceipt && businessProfile && (
                <ReceiptModal 
                    transaction={selectedReceipt} 
                    businessProfile={businessProfile}
                    onClose={() => setSelectedReceipt(null)} 
                />
            )}
        </div>
    );
};

export default Finance;

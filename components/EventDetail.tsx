
import React, { useState } from 'react';
import { Event, EventCost, Supplier, TimelineItem } from '../types';
import { ChevronLeftIcon, MapPinIcon, ClockIcon, ClipboardIcon, ShareIcon, CheckCircleIcon, StarIcon, CurrencyDollarIcon, PlusIcon, TrashIcon, ListBulletIcon, ChatBubbleLeftRightIcon } from './icons';
import { useMockData } from '../hooks/useMockData';

interface EventDetailProps {
  event: Event;
  onClose: () => void;
  onToggleTask: (taskId: string) => void;
  onAddCost?: (eventId: string, cost: Omit<EventCost, 'id'>) => void;
  onDeleteCost?: (eventId: string, costId: string) => void;
  privacyMode: boolean;
  suppliers?: Supplier[];
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose, onToggleTask, onAddCost, onDeleteCost, privacyMode, suppliers = [] }) => {
  const [activeTab, setActiveTab] = useState<'ops' | 'finance' | 'timeline'>('ops');
  const [newCost, setNewCost] = useState({ description: '', amount: '', category: 'Equipe' });
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  
  // Timeline State
  const [newTimelineItem, setNewTimelineItem] = useState({ time: '', title: '', description: '' });
  const { addTimelineItem, deleteTimelineItem, businessProfile } = useMockData();

  const totalTasks = event.checklist?.length || 0;
  const completedTasks = event.checklist?.filter(t => t.done).length || 0;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const costs = event.costs || [];
  const totalCosts = costs.reduce((acc, curr) => acc + curr.amount, 0);
  const revenue = event.amount || 0;
  const profit = revenue - totalCosts;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

  const formatCurrency = (value: number) => {
      if (privacyMode) return 'R$ ****';
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleShareOS = () => {
    const checklistText = event.checklist?.map(t => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n') || 'Sem tarefas';
    const message = `*ORDEM DE SERVIÇO - ${event.title}*\n\n📅 Data: ${event.date.toLocaleDateString('pt-BR')}\n📍 Local: ${event.location || 'A definir'}\n⏰ Horário: ${event.startTime || '?'} - ${event.endTime || '?'}\n\n*CHECKLIST OPERACIONAL*\n${checklistText}\n\nGerado por Mil Eventos`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleRequestReview = () => {
    let message = businessProfile.messageTemplates?.reviewRequest || '';
    // Basic substitution if not using template engine
    if (!message) {
         message = `Olá ${event.clientName?.split(' ')[0]}! 👋\n\nEspero que tenha gostado do meu trabalho no evento *${event.title}*! Foi um prazer participar desse momento.\n\nVocê poderia me deixar uma avaliação? Isso me ajuda muito a continuar crescendo! ⭐⭐⭐⭐⭐\n\n(Aqui você pode colar seu link do Google Meu Negócio ou Instagram)\n\nObrigado!`;
    } else {
        message = message
            .replace(/{cliente}/g, event.clientName?.split(' ')[0] || 'Cliente')
            .replace(/{evento}/g, event.title);
    }
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleShareTimeline = () => {
      const timelineText = event.timeline?.map(t => `🕒 *${t.time}* - ${t.title}\n${t.description ? `_${t.description}_` : ''}`).join('\n\n') || 'Sem itens';
      
      let message = businessProfile.messageTemplates?.timelineShare || '';
      
      if (!message) {
          message = `*CRONOGRAMA - ${event.title}*\n📅 Data: ${event.date.toLocaleDateString('pt-BR')}\n\n${timelineText}\n\nGerado por Mil Eventos`;
      } else {
          message = message
            .replace(/{evento}/g, event.title)
            .replace(/{data}/g, event.date.toLocaleDateString('pt-BR'))
            .replace(/{cronograma}/g, timelineText);
      }

      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
  };

  const handleAddCost = (e: React.FormEvent) => {
      e.preventDefault();
      if (newCost.description && newCost.amount && onAddCost) {
          onAddCost(event.id, {
              description: newCost.description,
              amount: parseFloat(newCost.amount),
              category: newCost.category as any
          });
          setNewCost({ description: '', amount: '', category: 'Equipe' });
          setSelectedSupplierId('');
      }
  };
  
  const handleAddTimelineItem = (e: React.FormEvent) => {
      e.preventDefault();
      if (newTimelineItem.time && newTimelineItem.title && addTimelineItem) {
          addTimelineItem(event.id, {
              time: newTimelineItem.time,
              title: newTimelineItem.title,
              description: newTimelineItem.description
          });
          setNewTimelineItem({ time: '', title: '', description: '' });
      }
  };

  const handleSupplierSelect = (supplierId: string) => {
      setSelectedSupplierId(supplierId);
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
          setNewCost(prev => ({
              ...prev,
              description: supplier.name,
              category: supplier.category
          }));
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <button onClick={onClose} className="text-gray-300 hover:text-white p-2 -ml-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Detalhes do Evento</h2>
        <div className="w-10"></div> 
      </div>

      <div className="flex space-x-1 bg-gray-800 p-2 shadow-sm">
          <button 
            onClick={() => setActiveTab('ops')}
            className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'ops' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
          >
              Checklist
          </button>
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'timeline' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
          >
              Cronograma
          </button>
          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex-1 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${activeTab === 'finance' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'}`}
          >
              Financeiro
          </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {/* Main Info */}
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                 <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded uppercase">{event.type}</span>
                 <span className="text-gray-400 text-sm">{event.date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{event.title}</h1>
            <p className="text-indigo-400 font-medium">{event.clientName}</p>
        </div>

        {activeTab === 'ops' && (
            <div className="animate-in fade-in duration-300">
                {/* Logistics Card */}
                <div className="bg-gray-800 rounded-xl p-5 shadow-md mb-6 border border-gray-700">
                    <h3 className="text-gray-300 font-bold mb-4 text-sm uppercase tracking-wider border-b border-gray-700 pb-2">Logística</h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <MapPinIcon className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Localização</p>
                                <p className="text-white font-medium">{event.location || 'Não definido'}</p>
                                {event.location && (
                                    <a href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 underline mt-1 block">
                                        Ver no Mapa
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start">
                            <ClockIcon className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Horário</p>
                                <p className="text-white font-medium">
                                    {event.startTime || '--:--'} às {event.endTime || '--:--'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Checklist Section */}
                <div className="bg-gray-800 rounded-xl p-5 shadow-md mb-6 border border-gray-700">
                    <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
                        <h3 className="text-gray-300 font-bold text-sm uppercase tracking-wider flex items-center">
                            <ClipboardIcon className="w-4 h-4 mr-2 text-gray-400" />
                            Checklist
                        </h3>
                        <span className="text-xs font-mono bg-gray-900 px-2 py-0.5 rounded text-gray-400">
                            {completedTasks}/{totalTasks}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-900 rounded-full h-2 mb-4">
                        <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="space-y-1">
                        {event.checklist && event.checklist.length > 0 ? (
                            event.checklist.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => onToggleTask(task.id)}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${task.done ? 'bg-green-900/10 text-gray-500' : 'hover:bg-gray-700 text-white'}`}
                                >
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${task.done ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                        {task.done && <CheckCircleIcon className="w-4 h-4 text-white" />}
                                    </div>
                                    <span className={task.done ? 'line-through' : ''}>{task.text}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm italic text-center py-2">Nenhuma tarefa cadastrada.</p>
                        )}
                    </div>
                </div>

                {/* Post-Event Action */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-750 rounded-xl p-5 shadow-md mb-6 border border-gray-700 relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
                    <h3 className="text-gray-300 font-bold text-sm uppercase tracking-wider mb-2 relative z-10">Pós-Evento</h3>
                    <p className="text-xs text-gray-400 mb-4 relative z-10">O evento já passou? Aproveite para fidelizar o cliente e pedir um feedback.</p>
                    
                    <button 
                        onClick={handleRequestReview}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-yellow-400 border border-yellow-500/30 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors relative z-10"
                    >
                        <StarIcon className="w-5 h-5 mr-2" />
                        Solicitar Avaliação (Script)
                    </button>
                </div>
            </div>
        )}
        
        {activeTab === 'timeline' && (
            <div className="animate-in fade-in duration-300">
                {/* Timeline Header/Action */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-300 font-bold text-sm uppercase tracking-wider flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2 text-indigo-400" />
                        Run of Show
                    </h3>
                    <button 
                        onClick={handleShareTimeline}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-400 px-3 py-1 rounded text-xs font-bold flex items-center transition-colors border border-green-600/50"
                    >
                        <ShareIcon className="w-3 h-3 mr-1" />
                        Enviar Zap
                    </button>
                </div>

                {/* Add Timeline Item */}
                <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700 mb-6">
                    <form onSubmit={handleAddTimelineItem} className="flex flex-col gap-3">
                         <div className="flex gap-3">
                             <input 
                                type="time" 
                                value={newTimelineItem.time}
                                onChange={e => setNewTimelineItem({...newTimelineItem, time: e.target.value})}
                                className="w-24 bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                required
                             />
                             <input 
                                type="text" 
                                placeholder="Atividade (ex: Valsa)"
                                value={newTimelineItem.title}
                                onChange={e => setNewTimelineItem({...newTimelineItem, title: e.target.value})}
                                className="flex-1 bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                                required
                             />
                         </div>
                         <input 
                            type="text"
                            placeholder="Detalhes (opcional)"
                            value={newTimelineItem.description}
                            onChange={e => setNewTimelineItem({...newTimelineItem, description: e.target.value})}
                            className="w-full bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                         />
                         <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-sm flex justify-center items-center">
                             <PlusIcon className="w-4 h-4 mr-1" /> Adicionar ao Cronograma
                         </button>
                    </form>
                </div>

                {/* Timeline Visual */}
                <div className="relative space-y-0">
                    {/* Vertical Line */}
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-700"></div>
                    
                    {event.timeline && event.timeline.length > 0 ? (
                        event.timeline.map((item, index) => (
                            <div key={item.id} className="relative pl-10 pb-6 group">
                                {/* Dot */}
                                <div className="absolute left-[10px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-gray-900 z-10 group-hover:scale-125 transition-transform"></div>
                                
                                <div className="flex justify-between items-start bg-gray-800/50 p-3 rounded-lg border border-gray-700/50 hover:bg-gray-800 transition-colors">
                                    <div>
                                        <span className="text-indigo-400 font-mono font-bold text-sm block mb-1">{item.time}</span>
                                        <h4 className="text-white font-bold text-base leading-tight">{item.title}</h4>
                                        {item.description && (
                                            <p className="text-gray-400 text-xs mt-1">{item.description}</p>
                                        )}
                                    </div>
                                    {deleteTimelineItem && (
                                        <button 
                                            onClick={() => deleteTimelineItem(event.id, item.id)}
                                            className="text-gray-600 hover:text-red-500 p-1"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 pl-4">
                            <p className="text-gray-500 text-sm italic">Nenhum item no cronograma.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

        {activeTab === 'finance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
                         <p className="text-xs text-gray-500 uppercase font-bold">Faturamento</p>
                         <p className="text-xl font-bold text-green-400">{formatCurrency(revenue)}</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
                         <p className="text-xs text-gray-500 uppercase font-bold">Custos Totais</p>
                         <p className="text-xl font-bold text-red-400">{formatCurrency(totalCosts)}</p>
                    </div>
                </div>

                {/* Profit Card */}
                <div className={`rounded-xl p-6 shadow-md border ${margin > 50 ? 'bg-green-900/20 border-green-500/50' : 'bg-yellow-900/20 border-yellow-500/50'}`}>
                    <div className="flex justify-between items-center">
                         <div>
                             <p className="text-sm text-gray-400 font-bold uppercase">Lucro Líquido</p>
                             <p className={`text-3xl font-bold ${margin > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                                 {formatCurrency(profit)}
                             </p>
                         </div>
                         <div className="text-right">
                             <p className="text-xs text-gray-400 font-bold uppercase">Margem</p>
                             <p className={`text-xl font-bold ${margin > 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                                 {privacyMode ? '**' : Math.round(margin)}%
                             </p>
                         </div>
                    </div>
                </div>

                {/* Add Cost Form */}
                <div className="bg-gray-800 p-5 rounded-xl shadow-md border border-gray-700">
                    <h3 className="text-sm font-bold text-white uppercase mb-3 flex items-center">
                        <PlusIcon className="w-4 h-4 mr-1 text-indigo-400" />
                        Adicionar Custo
                    </h3>
                    <form onSubmit={handleAddCost} className="grid grid-cols-2 gap-3">
                        {suppliers.length > 0 && (
                             <select
                                value={selectedSupplierId}
                                onChange={(e) => handleSupplierSelect(e.target.value)}
                                className="col-span-2 bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none mb-1"
                            >
                                <option value="">-- Selecionar Parceiro (Opcional) --</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.category})</option>)}
                            </select>
                        )}
                        <input 
                            type="text"
                            placeholder="Descrição (ex: Uber)"
                            className="col-span-2 bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={newCost.description}
                            onChange={e => setNewCost({...newCost, description: e.target.value})}
                        />
                        <input 
                            type="number"
                            placeholder="Valor (R$)"
                            className="bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={newCost.amount}
                            onChange={e => setNewCost({...newCost, amount: e.target.value})}
                        />
                        <select 
                            className="bg-gray-700 text-white p-2 rounded text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
                            value={newCost.category}
                            onChange={e => setNewCost({...newCost, category: e.target.value})}
                        >
                            <option>Equipe</option>
                            <option>Transporte</option>
                            <option>Alimentação</option>
                            <option>Equipamento</option>
                            <option>Outros</option>
                        </select>
                        <button type="submit" className="col-span-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded text-sm">
                            Lançar Custo
                        </button>
                    </form>
                </div>

                {/* Costs List */}
                <div className="space-y-2">
                    <h3 className="text-xs font-bold text-gray-500 uppercase ml-1">Histórico de Custos</h3>
                    {costs.map(cost => (
                        <div key={cost.id} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <div>
                                <p className="text-sm text-white font-medium">{cost.description}</p>
                                <p className="text-xs text-gray-500">{cost.category}</p>
                            </div>
                            <div className="flex items-center">
                                <p className="text-sm font-bold text-red-400 mr-3">- {formatCurrency(cost.amount)}</p>
                                {onDeleteCost && (
                                    <button onClick={() => onDeleteCost(event.id, cost.id)} className="text-gray-600 hover:text-red-500">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {costs.length === 0 && (
                        <p className="text-center text-gray-500 text-xs italic py-4">Nenhum custo lançado.</p>
                    )}
                </div>
            </div>
        )}

      </div>

      {activeTab === 'ops' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 shadow-lg">
            <button 
                onClick={handleShareOS}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
                <ShareIcon className="w-5 h-5 mr-2" />
                Compartilhar O.S. com Equipe
            </button>
        </div>
      )}
    </div>
  );
};

export default EventDetail;

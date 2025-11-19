
import React, { useState, useEffect } from 'react';
import type { Proposal, Event, ServicePackage } from '../types';
import { generateProposalDescription } from '../services/geminiService';
import { SparklesIcon, PackageIcon, ExclamationTriangleIcon } from './icons';

interface ProposalModalProps {
  onClose: () => void;
  onSave: (proposal: Omit<Proposal, 'id' | 'status'>) => void;
  initialData?: Partial<Proposal> & { serviceType?: string };
  existingEvents?: Event[];
  services: ServicePackage[];
}

const ProposalModal: React.FC<ProposalModalProps> = ({ onClose, onSave, initialData, existingEvents = [], services }) => {
  const [clientName, setClientName] = useState('');
  const [eventName, setEventName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [dateConflict, setDateConflict] = useState<Event | null>(null);

  useEffect(() => {
      if (initialData) {
          if (initialData.clientName) setClientName(initialData.clientName);
          if (initialData.eventName) setEventName(initialData.eventName);
          if (initialData.amount) setAmount(initialData.amount.toString());
          if (initialData.date) setDate(initialData.date);
          if (initialData.serviceType) setServiceType(initialData.serviceType);
      }
  }, [initialData]);

  // Verificação de conflito de agenda robusta (Timezone Safe)
  useEffect(() => {
      if (date && existingEvents.length > 0) {
          // O input type="date" retorna YYYY-MM-DD
          const [year, month, day] = date.split('-').map(Number);
          
          const conflict = existingEvents.find(e => {
             // Comparamos as partes da data localmente para evitar problemas de fuso horário
             return e.date.getFullYear() === year && 
                    e.date.getMonth() === (month - 1) && // Mês em JS é 0-indexado
                    e.date.getDate() === day;
          });
          setDateConflict(conflict || null);
      } else {
          setDateConflict(null);
      }
  }, [date, existingEvents]);

  const handleSave = () => {
    if (clientName && eventName && amount) {
      onSave({
        clientName,
        eventName,
        amount: parseFloat(amount),
        date: date,
      });
    }
  };

  const handlePackageChange = (packageId: string) => {
      setSelectedPackageId(packageId);
      const pkg = services.find(s => s.id === packageId);
      if (pkg) {
          setAmount(pkg.price.toString());
          setDescription(pkg.description);
          setServiceType('Pacote Personalizado');
      }
  };

  const handleGenerateDescription = async () => {
    if (!eventName || !clientName) {
        alert("Por favor, preencha o nome do cliente e nome do evento.");
        return;
    }
    setIsGenerating(true);
    try {
        const context = description ? ` O pacote base inclui: ${description}.` : '';
        const promptServiceType = selectedPackageId ? services.find(s => s.id === selectedPackageId)?.name : serviceType;
        
        const generatedText = await generateProposalDescription(eventName, clientName, `${promptServiceType}${context}`);
        setDescription(generatedText);
    } catch (error) {
        console.error(error);
        setDescription("Erro ao gerar descrição.");
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4 animate-in fade-in duration-200 backdrop-blur-sm">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl w-full max-w-md overflow-y-auto max-h-[90vh] border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
            {initialData ? <SparklesIcon className="w-6 h-6 mr-2 text-indigo-400" /> : null}
            {initialData ? 'Proposta Mágica' : 'Nova Proposta'}
        </h2>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-5">
            
            {/* Client & Event Info */}
            <div>
                <label className="block text-xs text-gray-400 mb-1.5 uppercase font-bold tracking-wider">Dados do Evento</label>
                <input type="text" placeholder="Nome do Cliente" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg mb-3 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 transition-all" required />
                <input type="text" placeholder="Nome do Evento (ex: Casamento)" value={eventName} onChange={e => setEventName(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg mb-3 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none placeholder-gray-500 transition-all" required />
                
                <div className="relative">
                    <label className="block text-xs text-gray-400 mb-1 ml-1">Data do Evento</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className={`w-full bg-gray-900 text-white p-3 rounded-lg focus:outline-none transition-all ${dateConflict ? 'border-2 border-red-500 focus:ring-2 focus:ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'}`} 
                        required 
                    />
                    {dateConflict && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start animate-in fade-in slide-in-from-top-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-200">
                                <span className="font-bold block text-red-100">Conflito de Agenda Detectado!</span>
                                Você já tem o evento <span className="font-semibold text-white underline">{dateConflict.title}</span> agendado para este dia.
                                <div className="mt-1 text-xs opacity-80 bg-red-900/40 inline-block px-2 py-0.5 rounded">
                                    Horário Ocupado: {dateConflict.startTime || 'Integral'} - {dateConflict.endTime || ''}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Package Selection Strategy */}
            <div className="bg-gray-900/30 p-4 rounded-xl border border-gray-700/50">
                 <label className="block text-xs text-indigo-400 mb-2 uppercase font-bold flex items-center">
                     <PackageIcon className="w-3 h-3 mr-1" />
                     Seleção Rápida de Pacote
                 </label>
                 <select 
                    value={selectedPackageId} 
                    onChange={e => handlePackageChange(e.target.value)} 
                    className="w-full bg-gray-800 text-white p-2.5 rounded-lg border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                 >
                     <option value="">-- Personalizado (Manual) --</option>
                     {services.map(s => (
                         <option key={s.id} value={s.id}>{s.name} - R$ {s.price}</option>
                     ))}
                 </select>
            </div>

            {!selectedPackageId && (
                 <select value={serviceType} onChange={e => setServiceType(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none">
                    <option value="">Tipo de Serviço...</option>
                    <option>DJ</option>
                    <option>Fotografia</option>
                    <option>Decoração</option>
                    <option>Completo</option>
                </select>
            )}

            <div>
                <label className="block text-xs text-gray-400 mb-1 ml-1">Valor Total</label>
                <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">R$</span>
                    <input type="number" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-900 text-white p-3 pl-10 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold text-lg" required />
                </div>
            </div>
            
            <div className="relative">
              <label className="block text-xs text-gray-400 mb-1 uppercase font-bold tracking-wider">Descrição & Entregáveis</label>
              <textarea placeholder="Descreva os detalhes do serviço..." value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-sm" />
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={isGenerating}
                className="absolute right-2 top-8 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1 px-2.5 rounded-md flex items-center text-xs disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed shadow-lg transition-all"
              >
                <SparklesIcon className="w-3 h-3 mr-1.5"/>
                {isGenerating ? 'Gerando...' : 'IA Magic'}
              </button>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-gray-700">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors">Cancelar</button>
            <button type="submit" className={`px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-transform active:scale-95 shadow-lg shadow-indigo-600/20 flex items-center ${dateConflict ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : ''}`}>
                {dateConflict && <ExclamationTriangleIcon className="w-4 h-4 mr-2"/>}
                {dateConflict ? 'Criar Mesmo Assim' : 'Criar Proposta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;

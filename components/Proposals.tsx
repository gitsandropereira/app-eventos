
import React, { useState, useEffect, useMemo } from 'react';
import { ProposalStatus } from '../types';
import type { Proposal, BusinessProfile, Event, ServicePackage } from '../types';
import { PlusIcon, CalendarIcon } from './icons';
import ProposalModal from './ProposalModal';
import ProposalDetail from './ProposalDetail';
import { formatDateShort } from '../utils/date';

interface ProposalCardProps {
  proposal: Proposal;
  onClick: (proposal: Proposal) => void;
  privacyMode: boolean;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onClick, privacyMode }) => (
  <div 
    onClick={() => onClick(proposal)}
    className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-all border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 group relative"
  >
    <div className="flex justify-between items-start mb-1">
        <p className="font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors text-sm">{proposal.eventName}</p>
        <span className="text-xs text-gray-500 dark:text-gray-500">{formatDateShort(proposal.date)}</span>
    </div>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-medium">{proposal.clientName}</p>
    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
        <p className="text-base font-bold text-indigo-600 dark:text-indigo-400">
        {privacyMode ? 'R$ ****' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(proposal.amount)}
        </p>
        <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-medium">Ver Detalhes</span>
    </div>
  </div>
);

interface KanbanColumnProps {
  status: ProposalStatus;
  proposals: Proposal[];
  onProposalClick: (proposal: Proposal) => void;
  privacyMode: boolean;
}

const statusColors: { [key in ProposalStatus]: string } = {
  [ProposalStatus.Sent]: 'border-blue-500 text-blue-600 dark:text-blue-400',
  [ProposalStatus.Analysis]: 'border-yellow-500 text-yellow-600 dark:text-yellow-400',
  [ProposalStatus.Closing]: 'border-purple-500 text-purple-600 dark:text-purple-400',
  [ProposalStatus.Closed]: 'border-green-500 text-green-600 dark:text-green-400',
  [ProposalStatus.Lost]: 'border-red-500 text-red-600 dark:text-red-400',
};

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, proposals, onProposalClick, privacyMode }) => (
  <div className="flex-shrink-0 w-72 sm:w-80 bg-gray-100 dark:bg-gray-900/50 rounded-xl p-3 h-full flex flex-col border border-gray-200 dark:border-transparent">
    <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 pb-2 border-b-2 flex justify-between items-center ${statusColors[status]}`}>
        {status} 
        <span className="bg-gray-200 dark:bg-gray-800 px-2 py-0.5 rounded-full text-[10px] text-gray-700 dark:text-white">{proposals.length}</span>
    </h3>
    <div className="space-y-3 overflow-y-auto flex-1 pb-20 hide-scrollbar">
      {proposals.map(p => <ProposalCard key={p.id} proposal={p} onClick={onProposalClick} privacyMode={privacyMode} />)}
      {proposals.length === 0 && (
          <div className="text-center py-10 text-gray-400 dark:text-gray-600 text-xs italic border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
              Vazio
          </div>
      )}
    </div>
  </div>
);

interface ProposalsProps {
  initialProposals: Proposal[];
  onAddProposal: (proposal: Proposal) => void;
  onUpdateProposal: (proposal: Proposal) => void; // Make this mandatory
  businessProfile: BusinessProfile;
  draftProposal?: Partial<Proposal>;
  onClearDraft?: () => void;
  existingEvents: Event[]; // Added prop for conflict detection
  privacyMode: boolean;
  services: ServicePackage[];
}

const Proposals: React.FC<ProposalsProps> = ({ initialProposals, onAddProposal, onUpdateProposal, businessProfile, draftProposal, onClearDraft, existingEvents, privacyMode, services }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  useEffect(() => {
      if (draftProposal) {
          setIsModalOpen(true);
      }
  }, [draftProposal]);

  // Filter statuses to remove Analysis for cleaner view
  const visibleStatuses = [ProposalStatus.Sent, ProposalStatus.Closing, ProposalStatus.Closed, ProposalStatus.Lost];
  
  const filteredProposals = useMemo(() => {
      return initialProposals.filter(p => p.date.startsWith(monthFilter));
  }, [initialProposals, monthFilter]);

  const proposalsByStatus = (status: ProposalStatus) => filteredProposals.filter(p => p.status === status);

  const handleAddProposal = (proposal: Omit<Proposal, 'id' | 'status'>) => {
    const newProposal: Proposal = {
      ...proposal,
      id: (initialProposals.length + 1).toString(),
      status: ProposalStatus.Sent
    };
    onAddProposal(newProposal);
    setIsModalOpen(false);
    if (onClearDraft) onClearDraft();
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      if (onClearDraft) onClearDraft();
  }

  const handleUpdateProposal = (updatedProposal: Proposal) => {
      if (onUpdateProposal) {
          onUpdateProposal(updatedProposal);
      }
      setSelectedProposal(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Funil de Vendas</h2>
        
        <div className="flex gap-2">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                    type="month" 
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="pl-8 pr-2 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
                />
            </div>

            <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-full flex items-center transition-colors shadow-lg active:scale-95">
            <PlusIcon className="w-4 h-4 mr-2" />
            Nova
            </button>
        </div>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 flex-1 snap-x snap-mandatory">
        {visibleStatuses.map(status => (
          <div key={status} className="snap-center h-full">
             <KanbanColumn 
                status={status} 
                proposals={proposalsByStatus(status)} 
                onProposalClick={setSelectedProposal}
                privacyMode={privacyMode}
            />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <ProposalModal 
          onClose={handleCloseModal} 
          onSave={handleAddProposal}
          initialData={draftProposal}
          existingEvents={existingEvents} 
          services={services}
        />
      )}

      {selectedProposal && (
          <ProposalDetail
            proposal={selectedProposal}
            businessProfile={businessProfile}
            onClose={() => setSelectedProposal(null)}
            onUpdate={handleUpdateProposal}
          />
      )}
    </div>
  );
};

export default Proposals;


import React, { useState } from 'react';
import { Proposal, ProposalStatus, BusinessProfile } from '../types';
import { ChevronLeftIcon, ShareIcon, DocumentCheckIcon, CheckCircleIcon, XCircleIcon, ExternalLinkIcon, DocumentArrowDownIcon } from './icons';
import PublicProposalView from './PublicProposalView';
import { formatDate } from '../utils/date';
import { generateContractPDF } from '../utils/pdfGenerator';

interface ProposalDetailProps {
  proposal: Proposal;
  businessProfile: BusinessProfile;
  onClose: () => void;
  onUpdate: (updatedProposal: Proposal) => void;
}

const ProposalDetail: React.FC<ProposalDetailProps> = ({ proposal, businessProfile, onClose, onUpdate }) => {
  const [showContractPreview, setShowContractPreview] = useState(false);
  const [showPublicView, setShowPublicView] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleStatusChange = (newStatus: ProposalStatus) => {
    onUpdate({ ...proposal, status: newStatus });
  };

  const handleClientSigned = () => {
      // Callback when the "Client" signs via the Public View
      onUpdate({ ...proposal, status: ProposalStatus.Closed });
      setShowPublicView(false);
  };
  
  const handleDownloadPDF = () => {
      generateContractPDF(proposal, businessProfile);
  };

  const getWhatsAppLink = () => {
    const firstName = proposal.clientName.split(' ')[0];
    const uniqueLink = `https://mileventos.app/p/${proposal.id}`;
    
    let message = businessProfile.messageTemplates?.proposalSend || '';
    
    if (!message) {
        // Fallback default message
        message = `Olá ${firstName}! 👋\n\nAqui está o link da proposta para o evento *${proposal.eventName}*.\n\nVocê pode conferir todos os detalhes, valores e assinar digitalmente por aqui: ${uniqueLink}\n\nQualquer dúvida, estou à disposição!\n\n*${businessProfile.name}*`;
    } else {
        // Substitute variables
        message = message
            .replace(/{cliente}/g, firstName)
            .replace(/{evento}/g, proposal.eventName)
            .replace(/{link}/g, uniqueLink)
            .replace(/{valor}/g, formatCurrency(proposal.amount));
    }
    
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadgeColor = (status: ProposalStatus) => {
    switch (status) {
        case ProposalStatus.Sent: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
        case ProposalStatus.Analysis: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
        case ProposalStatus.Closing: return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
        case ProposalStatus.Closed: return 'bg-green-500/20 text-green-400 border-green-500/50';
        case ProposalStatus.Lost: return 'bg-red-500/20 text-red-400 border-red-500/50';
        default: return 'bg-gray-700 text-gray-400';
    }
  };

  if (showPublicView) {
      return (
          <PublicProposalView 
            proposal={proposal} 
            businessProfile={businessProfile} 
            onClose={() => setShowPublicView(false)}
            onSign={handleClientSigned}
          />
      );
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col animate-in slide-in-from-bottom-full duration-300">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between shadow-md">
        <button onClick={onClose} className="text-gray-300 hover:text-white p-2 -ml-2 rounded-full hover:bg-gray-700">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-semibold text-white">Detalhes da Proposta</h2>
        <div className="w-10"></div> {/* Spacer for alignment */}
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        {/* Status Banner */}
        <div className={`mb-6 p-3 rounded-lg border flex justify-between items-center ${getStatusBadgeColor(proposal.status)}`}>
            <span className="font-bold text-sm uppercase tracking-wide">{proposal.status}</span>
            <span className="text-xs opacity-80">{formatDate(proposal.date)}</span>
        </div>

        {/* Value Card */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 mb-6 shadow-lg text-center border border-indigo-500/30">
            <p className="text-indigo-200 text-sm font-medium mb-1">Valor Total da Proposta</p>
            <p className="text-4xl font-bold text-white">{formatCurrency(proposal.amount)}</p>
        </div>

        {/* Simulation Banner */}
        <div 
            onClick={() => setShowPublicView(true)}
            className="bg-gray-800 border border-indigo-500/30 rounded-xl p-4 mb-6 cursor-pointer hover:bg-gray-700 transition-colors group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">SIMULAÇÃO</div>
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="bg-indigo-500/20 p-2 rounded-full mr-3">
                        <ExternalLinkIcon className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Visualizar como Cliente</h3>
                        <p className="text-xs text-gray-400">Veja o link público e teste a assinatura</p>
                    </div>
                </div>
                <ChevronLeftIcon className="w-5 h-5 text-gray-500 rotate-180 group-hover:text-indigo-400 transition-colors" />
            </div>
        </div>

        {/* Client & Event Info */}
        <div className="bg-gray-800 rounded-xl p-5 shadow-sm mb-6 space-y-4">
            <div>
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Cliente</label>
                <p className="text-lg text-white font-medium">{proposal.clientName}</p>
            </div>
            <div className="border-t border-gray-700 pt-3">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Evento</label>
                <p className="text-lg text-white font-medium">{proposal.eventName}</p>
            </div>
             <div className="border-t border-gray-700 pt-3">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Descrição (Gerada por IA)</label>
                <p className="text-gray-300 mt-1 text-sm leading-relaxed italic">
                    "Preparar uma experiência inesquecível para {proposal.clientName} no evento {proposal.eventName}, garantindo excelência e profissionalismo em cada detalhe."
                </p>
            </div>
        </div>

        {/* Contract Terms Preview */}
        {showContractPreview && (
            <div className="bg-gray-800 rounded-xl p-5 shadow-sm mb-6 border border-gray-600">
                <h3 className="text-white font-bold mb-2 flex items-center">
                    <DocumentCheckIcon className="w-5 h-5 mr-2 text-green-400"/>
                    Termos do Contrato
                </h3>
                <div className="text-xs text-gray-400 font-mono bg-gray-900 p-3 rounded mb-3 max-h-40 overflow-y-auto">
                    {businessProfile.contractTerms || "Nenhum termo configurado."}
                </div>
                <div className="text-xs text-gray-400">
                    <span className="font-bold">Chave PIX:</span> {businessProfile.pixKey} ({businessProfile.pixKeyType})
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                    <button 
                        onClick={() => setShowContractPreview(false)}
                        className="py-2 text-sm text-gray-400 hover:text-white bg-gray-700 rounded hover:bg-gray-600"
                    >
                        Fechar Preview
                    </button>
                    <button 
                        onClick={handleDownloadPDF}
                        className="py-2 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500 flex justify-center items-center"
                    >
                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                        Baixar PDF
                    </button>
                </div>
            </div>
        )}

      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
        
        {/* Quick Status Actions */}
        <div className="flex justify-between gap-2 mb-4 overflow-x-auto pb-2">
            {proposal.status !== ProposalStatus.Closed && (
                <button 
                    onClick={() => handleStatusChange(ProposalStatus.Closed)}
                    className="flex-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/50 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-medium whitespace-nowrap transition-colors"
                >
                    <CheckCircleIcon className="w-4 h-4 mr-2"/>
                    Marcar Fechado
                </button>
            )}
             {proposal.status !== ProposalStatus.Lost && (
                <button 
                    onClick={() => handleStatusChange(ProposalStatus.Lost)}
                    className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/50 py-2 px-3 rounded-lg flex items-center justify-center text-sm font-medium whitespace-nowrap transition-colors"
                >
                    <XCircleIcon className="w-4 h-4 mr-2"/>
                    Marcar Perdido
                </button>
            )}
        </div>

        {/* Main CTAs */}
        <div className="grid grid-cols-2 gap-3">
            <a 
                href={getWhatsAppLink()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
                <ShareIcon className="w-5 h-5 mr-2" />
                Enviar Zap (Script)
            </a>
            <button 
                onClick={() => setShowContractPreview(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
                <DocumentCheckIcon className="w-5 h-5 mr-2" />
                Ver Contrato
            </button>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;

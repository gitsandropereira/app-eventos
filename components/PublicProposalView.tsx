
import React, { useState } from 'react';
import { Proposal, BusinessProfile, ProposalStatus } from '../types';
import { CheckCircleIcon, PenIcon, XCircleIcon, DocumentArrowDownIcon } from './icons';
import { formatDate } from '../utils/date';
import { generateContractPDF } from '../utils/pdfGenerator';

interface PublicProposalViewProps {
  proposal: Proposal;
  businessProfile: BusinessProfile;
  onClose: () => void;
  onSign: () => void;
}

const PublicProposalView: React.FC<PublicProposalViewProps> = ({ proposal, businessProfile, onClose, onSign }) => {
  const [showSignModal, setShowSignModal] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerCpf, setSignerCpf] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [isSigned, setIsSigned] = useState(false);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigning(true);
    
    // Simulate network request for digital signature
    setTimeout(() => {
        setIsSigning(false);
        setIsSigned(true);
        setShowSignModal(false);
        
        // Wait a moment to show success before closing or notifying parent
        setTimeout(() => {
            onSign();
        }, 2000);
    }, 1500);
  };
  
  const handleDownload = () => {
      generateContractPDF(proposal, businessProfile);
  };

  if (isSigned) {
      return (
          <div className="fixed inset-0 z-[60] bg-green-50 flex flex-col justify-center items-center p-6 animate-in fade-in duration-500">
              <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
                      <CheckCircleIcon className="h-12 w-12 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contrato Assinado!</h2>
                  <p className="text-gray-600 mb-6">
                      Parabéns! A proposta para o evento <strong>{proposal.eventName}</strong> foi confirmada com sucesso.
                  </p>
                  <p className="text-sm text-gray-400 mb-4">Você pode baixar uma cópia do contrato agora.</p>
                  <button 
                    onClick={handleDownload}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold mb-3 flex items-center justify-center"
                  >
                      <DocumentArrowDownIcon className="w-5 h-5 mr-2" /> Baixar Contrato
                  </button>
                  <button onClick={onClose} className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-semibold">
                      Fechar
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-gray-50 overflow-y-auto text-gray-800 font-sans">
      {/* Top Bar Simulation */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center">
           <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-500">Modo Visualização Cliente</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-2xl mx-auto pb-24">
        {/* Header / Branding */}
        <div className="bg-white p-6 md:p-10 text-center border-b border-gray-100">
            {businessProfile.logoUrl ? (
                 <img src={businessProfile.logoUrl} alt="Logo" className="h-20 w-20 mx-auto rounded-full object-cover mb-4 shadow-md" />
            ) : (
                <div className="h-20 w-20 mx-auto rounded-full bg-indigo-100 flex items-center justify-center mb-4 text-indigo-600 font-bold text-2xl">
                    {businessProfile.name.substring(0, 2).toUpperCase()}
                </div>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{businessProfile.name}</h1>
            <p className="text-gray-500 text-sm">{businessProfile.category}</p>
            <div 
                className="h-1 w-16 mx-auto mt-4 rounded-full" 
                style={{ backgroundColor: businessProfile.themeColor || '#4F46E5' }}
            ></div>
        </div>

        {/* Proposal Summary */}
        <div className="p-6">
            <div className="text-center mb-8">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Proposta Comercial Para</p>
                <h2 className="text-2xl font-bold text-gray-800">{proposal.clientName}</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Resumo do Evento</span>
                    <span className="text-sm text-gray-500">{formatDate(proposal.date)}</span>
                </div>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-indigo-600 mb-2">{proposal.eventName}</h3>
                    <p className="text-gray-600 leading-relaxed mb-6">
                         "Preparar uma experiência inesquecível para {proposal.clientName} no evento {proposal.eventName}, garantindo excelência e profissionalismo em cada detalhe."
                    </p>
                    <div className="flex justify-between items-end border-t border-dashed border-gray-200 pt-4">
                        <span className="text-gray-500 font-medium">Investimento Total</span>
                        <span className="text-3xl font-bold text-gray-900">{formatCurrency(proposal.amount)}</span>
                    </div>
                </div>
            </div>

            {/* Contract Terms */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Termos e Condições</h3>
                    <button onClick={handleDownload} className="text-indigo-600 text-sm font-semibold flex items-center hover:text-indigo-800">
                        <DocumentArrowDownIcon className="w-4 h-4 mr-1" /> Baixar PDF
                    </button>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 h-64 overflow-y-auto text-sm text-gray-600 leading-relaxed shadow-inner">
                    {businessProfile.contractTerms ? (
                        <pre className="whitespace-pre-wrap font-sans">{businessProfile.contractTerms}</pre>
                    ) : (
                        <p>Nenhum termo adicional configurado pelo contratado.</p>
                    )}
                </div>
            </div>

             {/* Pix Info */}
             <div className="bg-indigo-50 rounded-xl p-5 flex items-center mb-8">
                <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2 mr-4">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div>
                    <p className="text-sm font-bold text-indigo-900">Pagamento via PIX</p>
                    <p className="text-xs text-indigo-700">Chave: {businessProfile.pixKey}</p>
                </div>
             </div>
        </div>
      </div>

      {/* Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 z-20">
        <div className="text-center md:text-left hidden md:block">
            <p className="text-xs text-gray-500 uppercase">Valor a Pagar</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(proposal.amount)}</p>
        </div>
        <button 
            onClick={() => setShowSignModal(true)}
            className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 flex items-center justify-center"
        >
            <PenIcon className="w-5 h-5 mr-2" />
            Assinar Contrato Digitalmente
        </button>
      </div>

      {/* Signature Modal */}
      {showSignModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex justify-center items-end md:items-center">
            <div className="bg-white w-full md:w-[480px] rounded-t-2xl md:rounded-2xl p-6 animate-in slide-in-from-bottom duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Finalizar Contratação</h3>
                    <button onClick={() => setShowSignModal(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSign} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input 
                            type="text" 
                            required
                            value={signerName}
                            onChange={(e) => setSignerName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="Como no seu documento"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input 
                            type="text" 
                            required
                            value={signerCpf}
                            onChange={(e) => setSignerCpf(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 mt-4">
                        <label className="flex items-start gap-2 cursor-pointer">
                            <input type="checkbox" required className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500" />
                            <span>
                                Concordo com os termos do contrato apresentados e autorizo a assinatura digital deste documento com validade jurídica.
                            </span>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSigning}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl mt-4 flex justify-center items-center transition-colors disabled:opacity-70"
                    >
                        {isSigning ? (
                             <span className="animate-pulse">Processando...</span>
                        ) : (
                            <>
                                <CheckCircleIcon className="w-5 h-5 mr-2" />
                                Confirmar Assinatura
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default PublicProposalView;

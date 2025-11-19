
import React from 'react';
import { Transaction, BusinessProfile } from '../types';
import { XCircleIcon, PrinterIcon, CheckCircleIcon } from './icons';
import { formatDate } from '../utils/date';

interface ReceiptModalProps {
  transaction: Transaction;
  businessProfile: BusinessProfile;
  onClose: () => void;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, businessProfile, onClose }) => {
  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex justify-center items-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-sm shadow-2xl rounded-sm overflow-hidden">
        {/* Top Tear Effect (CSS trick or SVG could go here, keeping it simple for now) */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
            <h3 className="font-bold">Comprovante de Pagamento</h3>
            <button onClick={onClose} className="hover:text-gray-300"><XCircleIcon className="w-6 h-6"/></button>
        </div>

        {/* Receipt Content - This part is printable */}
        <div className="p-8 text-gray-800 font-mono text-sm" id="printable-receipt">
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold uppercase mb-1">{businessProfile.name}</h2>
                <p className="text-xs text-gray-500">{businessProfile.category}</p>
                {businessProfile.email && <p className="text-xs text-gray-500">{businessProfile.email}</p>}
                {businessProfile.phone && <p className="text-xs text-gray-500">{businessProfile.phone}</p>}
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-6"></div>

            <div className="mb-6">
                <p className="text-center font-bold text-lg mb-4">RECIBO</p>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Data:</span>
                    <span>{formatDate(transaction.date)}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Transação ID:</span>
                    <span>#{transaction.id.toUpperCase()}</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Cliente:</span>
                    <span className="font-bold">{transaction.clientName}</span>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-gray-500 mb-1">Descrição:</p>
                <p className="font-semibold">{transaction.description}</p>
            </div>

            <div className="border-b-2 border-dashed border-gray-300 mb-6"></div>

            <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold">TOTAL PAGO</span>
                <span className="text-xl font-bold">{formatCurrency(transaction.amount)}</span>
            </div>

            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center px-3 py-1 border-2 border-gray-800 rounded-full">
                    <CheckCircleIcon className="w-4 h-4 mr-1"/>
                    <span className="font-bold uppercase text-xs">Pagamento Confirmado</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-4">Documento gerado eletronicamente por Mil Eventos.</p>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-100 p-4 flex justify-center print:hidden">
            <button 
                onClick={handlePrint}
                className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded shadow-lg flex items-center transition-colors"
            >
                <PrinterIcon className="w-5 h-5 mr-2"/>
                Imprimir Recibo
            </button>
        </div>

        {/* Print Styles */}
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                #printable-receipt, #printable-receipt * {
                    visibility: visible;
                }
                #printable-receipt {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    margin: 0;
                    padding: 20px;
                }
                .print\\:hidden {
                    display: none !important;
                }
            }
        `}</style>
      </div>
    </div>
  );
};

export default ReceiptModal;

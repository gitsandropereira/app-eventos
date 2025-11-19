
import React from 'react';
import { BusinessProfile, ServicePackage } from '../types';
import { XCircleIcon, InstagramIcon, GlobeAltIcon } from './icons';

interface PublicSiteViewProps {
  businessProfile: BusinessProfile;
  services: ServicePackage[];
  onClose: () => void;
}

const PublicSiteView: React.FC<PublicSiteViewProps> = ({ businessProfile, services, onClose }) => {
  const handleContactClick = () => {
      const message = `Olá! Vi seu site e gostaria de um orçamento.`;
      const whatsappUrl = `https://wa.me/55${businessProfile.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-100 overflow-y-auto text-gray-800 font-sans flex flex-col">
      {/* Top Bar Simulation */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex justify-between items-center z-10">
        <div className="flex items-center">
           <span className="text-xs font-mono bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold">Seu Site Profissional</span>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XCircleIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="max-w-md mx-auto w-full bg-white min-h-screen shadow-2xl overflow-hidden">
         {/* Hero Section */}
         <div className="relative h-48 bg-gradient-to-br from-gray-800 to-black flex items-end p-6">
             {/* Cover Image Placeholder */}
             <div 
                className="absolute inset-0 opacity-40"
                style={{ 
                    backgroundImage: `radial-gradient(circle at center, ${businessProfile.themeColor} 0%, transparent 70%)`,
                }}
             ></div>
             
             <div className="relative z-10 w-full flex flex-col items-center -mb-12">
                 {businessProfile.logoUrl ? (
                     <img src={businessProfile.logoUrl} alt="Logo" className="h-24 w-24 rounded-full border-4 border-white shadow-md object-cover" />
                 ) : (
                    <div 
                        className="h-24 w-24 rounded-full border-4 border-white shadow-md flex items-center justify-center text-white font-bold text-3xl"
                        style={{ backgroundColor: businessProfile.themeColor || '#4F46E5' }}
                    >
                        {businessProfile.name.substring(0, 2).toUpperCase()}
                    </div>
                 )}
             </div>
         </div>

         {/* Bio Section */}
         <div className="pt-16 pb-8 px-6 text-center">
             <h1 className="text-2xl font-bold text-gray-900 mb-1">{businessProfile.name}</h1>
             <p className="text-gray-500 font-medium text-sm mb-4">{businessProfile.category}</p>
             
             <p className="text-gray-600 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                 {businessProfile.bio || "Transformando eventos em memórias inesquecíveis. Entre em contato para saber mais sobre nossos serviços."}
             </p>

             <div className="flex justify-center space-x-4 mb-6">
                 {businessProfile.instagram && (
                     <a href={`https://instagram.com/${businessProfile.instagram}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                         <InstagramIcon className="w-6 h-6" />
                     </a>
                 )}
                 {businessProfile.website && (
                     <a href={`https://${businessProfile.website}`} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-indigo-600 transition-colors">
                         <GlobeAltIcon className="w-6 h-6" />
                     </a>
                 )}
             </div>

             <button 
                onClick={handleContactClick}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-green-500/30 transition-transform active:scale-95"
             >
                 Pedir Orçamento no Zap
             </button>
         </div>

         {/* Services Section */}
         <div className="bg-gray-50 px-6 py-8 rounded-t-3xl border-t border-gray-100">
             <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Nossos Pacotes</h2>
             <div className="space-y-4">
                 {services.map(service => (
                     <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:border-indigo-200 transition-colors">
                         <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-gray-900">{service.name}</h3>
                             <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                             </span>
                         </div>
                         <p className="text-sm text-gray-500">{service.description}</p>
                     </div>
                 ))}
                 {services.length === 0 && (
                     <p className="text-center text-gray-400 text-sm italic">Nenhum serviço cadastrado.</p>
                 )}
             </div>
         </div>
         
         {/* Footer */}
         <div className="bg-white py-6 text-center border-t border-gray-200 pb-24">
             <p className="text-xs text-gray-400">
                 © {new Date().getFullYear()} {businessProfile.name}
             </p>
             <p className="text-[10px] text-gray-300 mt-1">
                 Powered by Mil Eventos
             </p>
         </div>
      </div>
    </div>
  );
};

export default PublicSiteView;

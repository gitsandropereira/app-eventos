
import React, { useState, useEffect } from 'react';
import type { BusinessProfile, ServicePackage } from '../types';
import { BriefcaseIcon, SparklesIcon, PackageIcon, PlusIcon, TrashIcon, GlobeAltIcon, UserCircleIcon, InstagramIcon, ShareIcon, ExternalLinkIcon, ChatBubbleLeftRightIcon, ArrowRightOnRectangleIcon, CloudArrowUpIcon } from './icons';
import PublicSiteView from './PublicSiteView';
import { isSupabaseConfigured } from '../src/lib/supabase';

interface SettingsProps {
  profile: BusinessProfile;
  onSave: (profile: BusinessProfile) => void;
  onLogout: () => void;
  services: ServicePackage[];
  onAddService: (service: Omit<ServicePackage, 'id' | 'user_id'>) => void;
  onDeleteService: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ profile, onSave, onLogout, services, onAddService, onDeleteService }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'website' | 'scripts'>('profile');
  const [formData, setFormData] = useState<BusinessProfile>(profile);
  const [isSaved, setIsSaved] = useState(false);
  const [showSitePreview, setShowSitePreview] = useState(false);
  const [logoError, setLogoError] = useState('');
  
  const [newService, setNewService] = useState({ name: '', price: '', description: '' });

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => setIsSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  // Ensure form data syncs if profile props update from upstream (after mock data loads)
  useEffect(() => {
      setFormData(profile);
  }, [profile]);

  const handleChange = (field: keyof BusinessProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTemplateChange = (field: string, value: string) => {
      setFormData(prev => ({
          ...prev,
          messageTemplates: {
              ...prev.messageTemplates,
              [field]: value
          } as any
      }));
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setLogoError('');
      
      if (file) {
          if (file.size > 500000) { // 500KB limit
              setLogoError('A imagem deve ter menos de 500KB.');
              return;
          }
          
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64 = reader.result as string;
              handleChange('logoUrl', base64);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setIsSaved(true);
  };

  const handleAddService = (e: React.FormEvent) => {
      e.preventDefault();
      if (newService.name && newService.price) {
          onAddService({
              name: newService.name,
              price: parseFloat(newService.price),
              description: newService.description
          });
          setNewService({ name: '', price: '', description: '' });
      }
  };

  const handleLogoutClick = (e: React.MouseEvent) => {
      e.preventDefault();
      // Direct logout action without confirmation window which might be blocked
      onLogout();
  };

  if (showSitePreview) {
      return (
          <PublicSiteView 
             businessProfile={formData} 
             services={services} 
             onClose={() => setShowSitePreview(false)} 
          />
      );
  }

  return (
    <div className="pb-20">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Configurações</h2>
        <div className="flex items-center space-x-2">
            <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border flex items-center ${isSupabaseConfigured ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'}`}>
                <div className={`w-2 h-2 rounded-full mr-1.5 ${isSupabaseConfigured ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                {isSupabaseConfigured ? 'Nuvem' : 'Local'}
            </div>

            {isSaved && activeTab !== 'services' && (
            <span className="text-green-400 text-xs font-bold animate-pulse bg-green-400/10 px-2 py-1 rounded-full">
                Salvo!
            </span>
            )}
            <button 
                type="button"
                onClick={handleLogoutClick}
                className="bg-gray-200 dark:bg-gray-800 text-red-500 dark:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors shadow-sm"
                title="Sair da Conta"
            >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg mb-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'profile' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              Perfil
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              Pacotes
          </button>
          <button 
            onClick={() => setActiveTab('website')}
            className={`flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${activeTab === 'website' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              <GlobeAltIcon className="w-3 h-3 mr-1" />
              Site
          </button>
          <button 
            onClick={() => setActiveTab('scripts')}
            className={`flex-1 py-2 px-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${activeTab === 'scripts' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
              Scripts
          </button>
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
            {/* Section: Identidade Visual */}
            <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4 text-indigo-600 dark:text-indigo-400">
                <SparklesIcon className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-bold">Identidade & Branding</h3>
            </div>
            
            <div className="grid gap-4">
                 <div className="flex items-center space-x-4 mb-2">
                    {formData.logoUrl ? (
                        <img src={formData.logoUrl} alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500" />
                    ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500">
                            Sem Logo
                        </div>
                    )}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Logotipo da Empresa</label>
                        <label className="cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-white py-2 px-4 rounded-md text-sm flex items-center justify-center w-fit transition-colors border border-gray-300 dark:border-gray-600">
                            <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                            Carregar Imagem
                            <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                        {logoError && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{logoError}</p>}
                        <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Máx: 500KB (JPG/PNG)</p>
                    </div>
                </div>

                <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nome da Empresa</label>
                <input
                    type="text"
                    value={formData.name || ''}
                    onChange={e => handleChange('name', e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Categoria</label>
                    <select
                    value={formData.category || ''}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    >
                    <option>DJ</option>
                    <option>Fotografia</option>
                    <option>Decoração</option>
                    <option>Buffet</option>
                    <option>Assessoria Completa</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cor da Marca</label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="color"
                            value={formData.themeColor || '#4F46E5'}
                            onChange={e => handleChange('themeColor', e.target.value)}
                            className="h-12 w-12 rounded-md cursor-pointer border-0 bg-transparent"
                        />
                        <span className="text-sm text-gray-500 dark:text-gray-400 uppercase">{formData.themeColor}</span>
                    </div>
                </div>
                </div>
            </div>
            </section>

            {/* Section: Contato e Financeiro */}
            <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-4 text-indigo-600 dark:text-indigo-400">
                <BriefcaseIcon className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-bold">Operacional</h3>
            </div>

            <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">WhatsApp / Telefone</label>
                    <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={e => handleChange('phone', e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Comercial</label>
                    <input
                        type="email"
                        value={formData.email || ''}
                        onChange={e => handleChange('email', e.target.value)}
                        className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Dados Bancários (para Contratos)</label>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <select
                            value={formData.pixKeyType || 'CNPJ'}
                            onChange={e => handleChange('pixKeyType', e.target.value)}
                            className="col-span-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                        >
                            <option>CPF</option>
                            <option>CNPJ</option>
                            <option>Email</option>
                            <option>Telefone</option>
                            <option>Aleatória</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Chave PIX"
                            value={formData.pixKey || ''}
                            onChange={e => handleChange('pixKey', e.target.value)}
                            className="col-span-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                    </div>
                </div>
            </div>
            </section>

            {/* Section: Jurídico */}
            <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Termos Padrão do Contrato</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Estas cláusulas serão inseridas automaticamente em novos contratos.</p>
                <textarea
                    rows={6}
                    value={formData.contractTerms || ''}
                    onChange={e => handleChange('contractTerms', e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-mono"
                />
            </section>

            <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-transform transform active:scale-95 flex justify-center items-center"
            >
                Salvar Alterações
            </button>
        </form>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Add New Service */}
            <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-indigo-500/30">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2 text-indigo-500 dark:text-indigo-400"/>
                    Novo Pacote de Serviço
                </h3>
                <form onSubmit={handleAddService} className="space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                             <input
                                type="text"
                                placeholder="Nome do Pacote (ex: Casamento Básico)"
                                value={newService.name}
                                onChange={e => setNewService(prev => ({...prev, name: e.target.value}))}
                                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                        <div>
                             <input
                                type="number"
                                placeholder="Valor (R$)"
                                value={newService.price}
                                onChange={e => setNewService(prev => ({...prev, price: e.target.value}))}
                                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    <textarea
                        placeholder="O que está incluso? (ex: 4h de festa, som, iluminação...)"
                        value={newService.description}
                        onChange={e => setNewService(prev => ({...prev, description: e.target.value}))}
                        className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        rows={2}
                    />
                    <button 
                        type="submit" 
                        disabled={!newService.name || !newService.price}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-2 rounded-md transition-colors"
                    >
                        Adicionar Pacote
                    </button>
                </form>
            </section>

            {/* List Services */}
            <section className="space-y-3">
                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 uppercase text-xs tracking-wider mb-2 ml-1">Meus Pacotes Ativos</h3>
                {services.map(service => (
                    <div key={service.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{service.name}</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{service.description}</p>
                            <span className="inline-block bg-gray-100 dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-sm font-mono font-bold">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                            </span>
                        </div>
                        <button 
                            onClick={() => onDeleteService(service.id)}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {services.length === 0 && (
                    <p className="text-center text-gray-500 py-8 italic">Nenhum pacote cadastrado ainda.</p>
                )}
            </section>
        </div>
      )}

      {activeTab === 'website' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <section className="bg-gradient-to-br from-indigo-900 to-gray-800 p-6 rounded-xl shadow-lg border border-indigo-500/30">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center">
                            <GlobeAltIcon className="w-6 h-6 mr-2 text-indigo-300" />
                            Seu Link na Bio
                        </h3>
                        <p className="text-sm text-indigo-200 mt-1">Crie um mini-site profissional para o seu Instagram.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShowSitePreview(true)}
                        className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center shadow-lg hover:bg-indigo-50 transition-colors"
                      >
                          <ExternalLinkIcon className="w-4 h-4 mr-2" />
                          Ver Site
                      </button>
                  </div>
                  
                  <div className="bg-gray-900/50 p-3 rounded-lg flex items-center justify-between border border-indigo-500/20">
                      <code className="text-indigo-300 text-sm truncate">
                          mileventos.app/{formData.slug || 'seu-nome'}
                      </code>
                      <button type="button" className="text-xs bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-50 ml-2">Copiar</button>
                  </div>
              </section>

              <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <UserCircleIcon className="w-5 h-5 mr-2 text-gray-400" />
                      Sobre Você (Bio)
                  </h3>
                  <textarea
                      rows={4}
                      placeholder="Escreva uma breve apresentação para seus clientes..."
                      value={formData.bio || ''}
                      onChange={e => handleChange('bio', e.target.value)}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
              </section>

              <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                      <ShareIcon className="w-5 h-5 mr-2 text-gray-400" />
                      Redes Sociais
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                              <InstagramIcon className="w-4 h-4 mr-1" /> Instagram (usuário)
                          </label>
                          <div className="flex items-center">
                              <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 p-3 rounded-l-md border-r border-gray-300 dark:border-gray-500">@</span>
                              <input
                                  type="text"
                                  placeholder="usuario"
                                  value={formData.instagram || ''}
                                  onChange={e => handleChange('instagram', e.target.value)}
                                  className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-r-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                              />
                          </div>
                      </div>
                      <div>
                           <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                              <GlobeAltIcon className="w-4 h-4 mr-1" /> Website (opcional)
                          </label>
                          <input
                                type="text"
                                placeholder="www.seusite.com.br"
                                value={formData.website || ''}
                                onChange={e => handleChange('website', e.target.value)}
                                className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                      </div>
                  </div>
              </section>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-transform transform active:scale-95 flex justify-center items-center"
            >
                Salvar Site
            </button>
          </form>
      )}

      {activeTab === 'scripts' && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 p-4 rounded-lg mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Dica:</strong> Use variáveis como <code>{'{cliente}'}</code>, <code>{'{evento}'}</code>, <code>{'{link}'}</code> para personalizar automaticamente suas mensagens.
                  </p>
              </div>

              <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Envio de Proposta</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Mensagem ao compartilhar o link da proposta.</p>
                  <textarea
                      rows={5}
                      value={formData.messageTemplates?.proposalSend || ''}
                      onChange={e => handleTemplateChange('proposalSend', e.target.value)}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-sans leading-relaxed"
                  />
              </section>

              <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Solicitação de Avaliação</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Mensagem pós-evento pedindo feedback.</p>
                  <textarea
                      rows={5}
                      value={formData.messageTemplates?.reviewRequest || ''}
                      onChange={e => handleTemplateChange('reviewRequest', e.target.value)}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-sans leading-relaxed"
                  />
              </section>

              <section className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Compartilhar Cronograma</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Mensagem ao enviar o Run of Show para a equipe.</p>
                  <textarea
                      rows={5}
                      value={formData.messageTemplates?.timelineShare || ''}
                      onChange={e => handleTemplateChange('timelineShare', e.target.value)}
                      className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-sans leading-relaxed"
                  />
              </section>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-lg shadow-lg transition-transform transform active:scale-95 flex justify-center items-center"
            >
                Salvar Scripts
            </button>
          </form>
      )}
    </div>
  );
};

export default Settings;

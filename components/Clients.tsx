
import React, { useState } from 'react';
import { Client, Supplier } from '../types';
import { SearchIcon, PlusIcon, BriefcaseIcon, CalendarIcon, TruckIcon, UsersIcon, TrashIcon } from './icons';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'proposals' | 'events'>) => void;
  suppliers: Supplier[];
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onDeleteSupplier: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, onAddClient, suppliers, onAddSupplier, onDeleteSupplier }) => {
  const [activeTab, setActiveTab] = useState<'clients' | 'suppliers'>('clients');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Supplier Form State
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierCategory, setNewSupplierCategory] = useState('Equipe');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient({
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail
    });
    setIsModalOpen(false);
    resetForms();
  };

  const handleAddSupplier = (e: React.FormEvent) => {
      e.preventDefault();
      onAddSupplier({
          name: newSupplierName,
          phone: newSupplierPhone,
          category: newSupplierCategory as any
      });
      setIsModalOpen(false);
      resetForms();
  };

  const resetForms = () => {
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewSupplierName('');
      setNewSupplierPhone('');
  };

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {activeTab === 'clients' ? 'Meus Clientes' : 'Parceiros & Fornecedores'}
        </h2>
        <button
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full flex items-center shadow-lg transition-transform transform active:scale-95 text-sm"
        >
            <PlusIcon className="w-4 h-4 mr-1" />
            Novo
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg mb-6 transition-colors">
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex-1 py-2 rounded-md text-sm font-medium flex justify-center items-center transition-all ${activeTab === 'clients' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              <UsersIcon className="w-4 h-4 mr-2" />
              Clientes
          </button>
          <button 
            onClick={() => setActiveTab('suppliers')}
            className={`flex-1 py-2 rounded-md text-sm font-medium flex justify-center items-center transition-all ${activeTab === 'suppliers' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
          >
              <TruckIcon className="w-4 h-4 mr-2" />
              Parceiros
          </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out shadow-sm"
          placeholder={activeTab === 'clients' ? "Buscar cliente..." : "Buscar parceiro ou categoria..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {activeTab === 'clients' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClients.map(client => (
            <div key={client.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 group">
                <div className="flex items-start space-x-4">
                <div className={`flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRandomColor(client.name)} shadow-sm`}>
                    {getInitials(client.name)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                    {client.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {client.phone}
                    </p>
                    {client.email && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 truncate">
                        {client.email}
                    </p>
                    )}
                </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex space-x-4">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400" title="Propostas">
                            <BriefcaseIcon className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400"/>
                            {client.proposals}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400" title="Eventos Confirmados">
                            <CalendarIcon className="w-4 h-4 mr-1 text-green-500 dark:text-green-400"/>
                            {client.events}
                        </div>
                    </div>
                    <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium transition-colors">
                        Ver Detalhes
                    </button>
                </div>
            </div>
            ))}
             {filteredClients.length === 0 && (
                <div className="text-center py-10 text-gray-500 col-span-full">
                Nenhum cliente encontrado.
                </div>
            )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
                <div className="flex items-start space-x-4">
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300`}>
                        <TruckIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                            {supplier.name}
                        </p>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/50 rounded-full mb-1 mt-0.5">
                            {supplier.category}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {supplier.phone}
                        </p>
                    </div>
                    <button 
                        onClick={() => onDeleteSupplier(supplier.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                </div>
                 <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <a href={`https://wa.me/55${supplier.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs font-bold flex items-center">
                        Chamar no Zap
                    </a>
                 </div>
            </div>
            ))}
            {filteredSuppliers.length === 0 && (
                <div className="text-center py-10 text-gray-500 col-span-full">
                Nenhum parceiro encontrado.
                </div>
            )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeTab === 'clients' ? 'Novo Cliente' : 'Novo Parceiro'}
                </h3>
            </div>
            
            {activeTab === 'clients' ? (
                <form onSubmit={handleAddClient} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">Nome Completo</label>
                    <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: João Silva"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">WhatsApp / Telefone</label>
                    <input
                    type="tel"
                    required
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">Email (Opcional)</label>
                    <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="cliente@email.com"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md"
                    >
                    Salvar Cliente
                    </button>
                </div>
                </form>
            ) : (
                <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">Nome / Empresa</label>
                    <input
                    type="text"
                    required
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Ex: João Fotografia"
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">Categoria</label>
                    <select
                    value={newSupplierCategory}
                    onChange={(e) => setNewSupplierCategory(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    >
                        <option>Equipe</option>
                        <option>Transporte</option>
                        <option>Alimentação</option>
                        <option>Equipamento</option>
                        <option>Outros</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-1">WhatsApp / Contato</label>
                    <input
                    type="tel"
                    required
                    value={newSupplierPhone}
                    onChange={(e) => setNewSupplierPhone(e.target.value)}
                    className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="(00) 00000-0000"
                    />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                    >
                    Cancelar
                    </button>
                    <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md"
                    >
                    Salvar Parceiro
                    </button>
                </div>
                </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;


import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User } from '../types';
import { LockClosedIcon, UserCircleIcon, CheckCircleIcon } from './icons';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => { // Simulate network delay
        if (isLogin) {
            const result = authService.login(email, password);
            if ('error' in result) {
                setError(result.error);
                setLoading(false);
            } else {
                onLogin(result);
            }
        } else {
            if (!name) {
                setError('Nome é obrigatório.');
                setLoading(false);
                return;
            }
            const result = authService.register(name, email, password);
            if ('error' in result) {
                setError(result.error);
                setLoading(false);
            } else {
                // Auto login after register
                onLogin(result);
            }
        }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        
        {/* Header */}
        <div className="bg-indigo-900/30 p-8 text-center border-b border-gray-700 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/30">
                <LockClosedIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Mil Eventos</h1>
            <p className="text-indigo-300 text-sm">Sua gestão profissional de eventos</p>
        </div>

        {/* Form */}
        <div className="p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
                {isLogin ? 'Acesse sua conta' : 'Crie sua conta grátis'}
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1 ml-1">Nome da Empresa/Profissional</label>
                        <div className="relative">
                             <span className="absolute left-3 top-3 text-gray-500"><UserCircleIcon className="w-5 h-5"/></span>
                             <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-gray-900 text-white pl-10 p-3 rounded-lg border border-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Ex: DJ Silva Eventos"
                            />
                        </div>
                    </div>
                )}
                <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1 ml-1">Email</label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="seu@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1 ml-1">Senha</label>
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        placeholder="******"
                        required
                        minLength={4}
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-3.5 rounded-lg shadow-lg shadow-indigo-900/20 transition-all flex justify-center items-center mt-6 active:scale-95"
                >
                    {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Começar Agora')}
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                    className="text-sm text-gray-400 hover:text-white transition-colors underline"
                >
                    {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
                </button>
            </div>
        </div>
      </div>
      
      <p className="text-gray-600 text-xs mt-8">
          &copy; {new Date().getFullYear()} Mil Eventos App
      </p>
    </div>
  );
};

export default Auth;
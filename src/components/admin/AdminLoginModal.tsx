import React, { useState } from 'react';
import { X, Lock, User, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { loginAdmin } from '../../services/api';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, username: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginAdmin(username, password);
      onLoginSuccess(res.token, res.username);
    } catch (err: any) {
      setError(err.message || 'Falha ao autenticar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 bg-stone-950 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950 text-rose-300 border border-rose-800/50">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-['Playfair_Display']">Área da Loja</h3>
              <p className="text-[11px] text-stone-400">Mariane Moreira Concept</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Usuário
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                placeholder="Ex: admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Senha
            </label>
            <div className="relative">
              <KeyRound size={16} className="absolute left-3 top-3 text-stone-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-rose-900"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-200 text-[11px] text-rose-950 flex items-start gap-2">
            <Sparkles size={14} className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Acesso padrão configurado:</span>
              <br />
              Usuário: <code className="bg-rose-100 px-1 rounded font-mono">admin</code> | Senha: <code className="bg-rose-100 px-1 rounded font-mono">admin123</code>
              <br />
              <span className="text-stone-500 text-[10px]">(Você pode alterar essa senha no painel a qualquer momento)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-rose-900 hover:bg-rose-950 text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Entrando...' : 'Entrar no Painel'}
          </button>
        </form>
      </div>
    </div>
  );
};

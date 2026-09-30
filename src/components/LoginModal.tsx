import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { ADMIN_CREDENTIALS } from '../data/defaultTasks';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanUser = username.trim();

    try {
      // Attempt backend API login first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password })
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        if (response.ok && data.success) {
          onSuccess(data.token, data.user);
          setUsername('');
          setPassword('');
          onClose();
          return;
        } else {
          setError(data.error || 'Credenciais inválidas. Verifique usuário e senha.');
          return;
        }
      } else {
        // Not a JSON endpoint (e.g. Netlify static hosting returning index.html for 404)
        throw new Error('Static/Netlify environment fallback');
      }
    } catch {
      // Fallback for Netlify / Static hosting without Node backend
      if (
        cleanUser.toLowerCase() === ADMIN_CREDENTIALS.username.toLowerCase() &&
        password === ADMIN_CREDENTIALS.password
      ) {
        onSuccess(ADMIN_CREDENTIALS.token, ADMIN_CREDENTIALS.user);
        setUsername('');
        setPassword('');
        onClose();
      } else {
        setError('Credenciais incorretas. Usuário ou senha inválidos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Gradient (Fixed top) */}
        <div className="bg-gradient-to-r from-[#0B3B95] to-[#08286A] p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <ShieldCheck className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-['Outfit'] tracking-tight">Área Administrativa</h3>
              <p className="text-xs text-blue-200 font-medium">Colégio Educar • Acesso Restrito</p>
            </div>
          </div>
        </div>

        {/* Content & Form (Scrollable when needed) */}
        <div className="p-6 flex-1 overflow-y-auto overscroll-contain">
          <div className="mb-5 p-3 rounded-xl bg-blue-50 border border-blue-100 flex items-start gap-2.5">
            <div className="w-5 h-5 text-[#0B3B95] mt-0.5 shrink-0 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong className="font-semibold text-slate-800">Acesso exclusivo para administradores:</strong> Insira suas credenciais para gerenciar, editar e movimentar as tarefas escolares.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700 animate-in fade-in-50 duration-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B3B95] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 px-4 bg-[#0B3B95] hover:bg-[#082d73] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Entrar no Painel</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

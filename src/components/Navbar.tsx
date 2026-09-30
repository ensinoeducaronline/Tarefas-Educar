import React from 'react';
import { EducarLogo } from './EducarLogo';
import { AdminUser, NotificationItem } from '../types';
import { 
  Bell, 
  LogIn, 
  LogOut, 
  Plus, 
  ShieldCheck, 
  Wifi, 
  WifiOff, 
  Volume2, 
  VolumeX, 
  Info,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  admin: AdminUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenNewTask: () => void;
  isConnected: boolean;
  unreadCount: number;
  onToggleNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  admin,
  onOpenLogin,
  onLogout,
  onOpenNewTask,
  isConnected,
  unreadCount,
  onToggleNotifications,
  soundEnabled,
  onToggleSound,
  onOpenAbout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Notice for Public Viewers */}
      <div className="bg-[#0B3B95] text-white text-xs py-1 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>
          {admin 
            ? 'Painel Administrativo Ativo • Você tem permissão para cadastrar e mover tarefas'
            : 'Dashboard Público do Colégio Educar • Modo de Visualização Aberto a Todos'}
        </span>
        {!admin && (
          <button 
            onClick={onOpenLogin}
            className="underline underline-offset-2 hover:text-orange-300 font-semibold cursor-pointer ml-1"
          >
            Acessar como Admin
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <EducarLogo size="md" showSlogan={true} />
          </div>

          {/* Center: Live Cloud Status Badge (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium">
            {isConnected ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="text-slate-700">Nuvem Conectada • Tempo Real</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-slate-700">Reconectando à Nuvem...</span>
              </>
            )}
          </div>

          {/* Right Action Controls (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Sons de notificação ativados' : 'Sons desativados'}
              className="p-2 rounded-xl text-slate-500 hover:text-[#0B3B95] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-[#0B3B95]" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 rounded-xl text-slate-600 hover:text-[#0B3B95] hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
              title="Notificações em tempo real"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E25822] text-[10px] font-bold text-white px-1 shadow-xs animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Info / About modal trigger */}
            <button
              onClick={onOpenAbout}
              className="p-2 rounded-xl text-slate-500 hover:text-[#0B3B95] hover:bg-blue-50 transition-colors cursor-pointer"
              title="Sobre o Sistema"
            >
              <Info className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* Admin Authenticated vs Public View */}
            {admin ? (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onOpenNewTask}
                  className="flex items-center gap-2 bg-[#E25822] hover:bg-[#d04915] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all duration-150 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nova Tarefa</span>
                </button>

                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 rounded-xl px-3 py-1.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0B3B95] text-white flex items-center justify-center font-bold text-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <div className="font-bold text-[#0B3B95]">Admin</div>
                    <div className="text-slate-500 text-[10px]">Educar</div>
                  </div>
                  <button
                    onClick={onLogout}
                    title="Encerrar sessão de administrador"
                    className="ml-2 text-slate-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 bg-[#0B3B95] hover:bg-[#082b70] text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Área Administrativa</span>
              </button>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Notification Bell */}
            <button
              onClick={onToggleNotifications}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute 0 top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E25822] text-[9px] font-bold text-white px-1">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3 bg-white">
            <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-600 bg-slate-50 rounded-lg">
              <span className="flex items-center gap-1.5 font-medium">
                {isConnected ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Nuvem em tempo real ativa
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Reconectando...
                  </>
                )}
              </span>
              <button
                onClick={onToggleSound}
                className="text-xs text-[#0B3B95] font-semibold flex items-center gap-1"
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {soundEnabled ? 'Sons Ligados' : 'Sons Mudos'}
              </button>
            </div>

            {admin ? (
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNewTask();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-[#E25822] text-white py-3 rounded-xl font-bold text-sm shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  <span>Cadastrar Nova Tarefa</span>
                </button>

                <div className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0B3B95]" />
                    <span className="text-sm font-semibold text-[#0B3B95]">Conectado como Administrador</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="text-xs font-bold text-red-600 bg-white px-3 py-1.5 rounded-lg border border-red-200"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLogin();
                }}
                className="w-full flex items-center justify-center gap-2 bg-[#0B3B95] text-white py-3 rounded-xl font-bold text-sm shadow-sm"
              >
                <LogIn className="w-5 h-5" />
                <span>Acessar Login de Admin</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAbout();
              }}
              className="w-full text-center text-xs text-slate-500 hover:text-[#0B3B95] py-1"
            >
              Sobre o Sistema do Colégio Educar
            </button>
          </div>
        )}

      </div>
    </header>
  );
};

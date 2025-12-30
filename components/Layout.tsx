
import React, { ReactNode } from 'react';
import { Home, PlusSquare, User, Gamepad2, Bell, Search, X, CheckCircle, Info, AlertCircle, PlayCircle, MessageSquare, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface LayoutProps {
  children: ReactNode;
  currentView: string;
  onNavigateFeed: () => void;
  onNavigateProfile: () => void;
  onNavigateCreate: () => void;
  onNavigateExplore: () => void;
  onNavigateNotifications: () => void;
  onNavigateReels: () => void;
  onNavigateMessages: () => void;
  onNavigateAdmin?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onNavigateFeed, 
  onNavigateProfile, 
  onNavigateCreate,
  onNavigateExplore,
  onNavigateNotifications,
  onNavigateReels,
  onNavigateMessages,
  onNavigateAdmin
}) => {
  const { currentUser, notifications, toasts, removeToast } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Strictly restricted to the requested email
  const isAdmin = currentUser?.email === "chmielp41@gmail.com";

  return (
    <div className="h-screen w-screen bg-background text-gray-100 flex flex-col md:flex-row font-sans overflow-hidden select-none">
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none max-w-[90vw]">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className={`pointer-events-auto flex items-center gap-3 min-w-[280px] md:min-w-[320px] p-4 rounded-xl shadow-2xl border animate-in slide-in-from-right duration-300 ${
              toast.type === 'error' ? 'bg-red-950/90 border-red-800 text-red-200' : 
              toast.type === 'info' ? 'bg-slate-800/90 border-slate-700 text-slate-200' :
              'bg-slate-800/90 border-green-900 text-green-200'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={20} className="text-green-500" />}
            {toast.type === 'error' && <AlertCircle size={20} className="text-red-500" />}
            {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
            <span className="font-medium text-sm flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="hover:opacity-70 p-1">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Desktop/Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-20 lg:w-64 border-r border-slate-800 p-4 lg:p-6 fixed h-full bg-slate-950 z-[60] transition-all duration-300">
        <div className="flex items-center gap-3 mb-12 cursor-pointer justify-center lg:justify-start group" onClick={onNavigateFeed}>
          <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
             <Gamepad2 className="text-white" size={26} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary hidden lg:block italic pr-4">
            LootDrop
          </h1>
        </div>

        <nav className="flex-1 space-y-3 lg:space-y-5">
          <SidebarItem 
            icon={<Home size={24} />} 
            label="Home Grid" 
            active={currentView === 'feed'} 
            onClick={onNavigateFeed} 
          />
          <SidebarItem 
            icon={<MessageSquare size={24} />} 
            label="Comms" 
            active={currentView === 'messages'} 
            onClick={onNavigateMessages} 
          />
          <SidebarItem 
            icon={<PlayCircle size={24} />} 
            label="Reel Clips" 
            active={currentView === 'reels'} 
            onClick={onNavigateReels} 
          />
          <SidebarItem 
            icon={<Search size={24} />} 
            label="Discovery" 
            active={currentView === 'explore'} 
            onClick={onNavigateExplore} 
          />
          <SidebarItem 
            icon={<Bell size={24} />} 
            label="Alert Logs" 
            active={currentView === 'notifications'} 
            badge={unreadCount > 0 ? unreadCount : undefined}
            onClick={onNavigateNotifications} 
          />
          <SidebarItem 
            icon={<PlusSquare size={24} />} 
            label="Drop Post" 
            active={currentView === 'create'} 
            onClick={onNavigateCreate} 
          />
          <SidebarItem 
            icon={<User size={24} />} 
            label="Commander" 
            active={currentView === 'profile'} 
            onClick={onNavigateProfile} 
          />
          {isAdmin && onNavigateAdmin && (
            <SidebarItem 
              icon={<Shield size={24} className="text-primary animate-pulse" />} 
              label="Admin Hub" 
              active={currentView === 'admin'} 
              onClick={onNavigateAdmin} 
            />
          )}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-800">
            <div className="flex items-center gap-4 cursor-pointer justify-center lg:justify-start group" onClick={onNavigateProfile}>
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img src={currentUser?.avatarUrl} alt="Me" className="w-11 h-11 rounded-full object-cover border-2 border-slate-700 group-hover:border-primary transition-colors relative z-10" />
                </div>
                <div className="flex flex-col hidden lg:flex">
                    <span className="text-sm font-black italic truncate max-w-[120px]">{currentUser?.username}</span>
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">
                      {isAdmin ? 'System Admin' : (currentUser?.badges.includes('Newbie') ? 'Rank: Newbie' : 'Rank: Elite')}
                    </span>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-300 md:ml-20 lg:ml-64 relative h-full overflow-hidden bg-background flex flex-col">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 flex items-center justify-between px-5 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 shrink-0 sticky top-0 z-[50]">
            <div className="flex items-center gap-2" onClick={onNavigateFeed}>
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Gamepad2 size={18} className="text-white" />
                </div>
                <h2 className="text-xl font-black italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary pr-4">LootDrop</h2>
            </div>
            
            <div className="flex items-center gap-4">
                <button onClick={onNavigateNotifications} className="relative text-slate-400">
                    <Bell size={22} />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />}
                </button>
                {/* Profile icon in header is ONLY for admin on mobile */}
                {isAdmin && (
                  <button onClick={onNavigateProfile} className="relative group active:scale-90 transition-transform">
                      <div className={`absolute inset-0 bg-primary/20 blur-md rounded-full transition-opacity ${currentView === 'profile' ? 'opacity-100' : 'opacity-0'}`} />
                      <img 
                        src={currentUser?.avatarUrl} 
                        alt="Profile" 
                        className={`w-9 h-9 rounded-full object-cover border-2 relative z-10 transition-colors ${currentView === 'profile' ? 'border-primary' : 'border-slate-800'}`} 
                      />
                  </button>
                )}
            </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center z-[50] px-4 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
        <button onClick={onNavigateFeed} className="p-2 transition-all active:scale-75">
            <Home size={24} className={currentView === 'feed' ? "text-primary scale-110" : "text-slate-500"} />
        </button>
        <button onClick={onNavigateMessages} className="p-2 transition-all active:scale-75 relative">
            <MessageSquare size={24} className={currentView === 'messages' ? "text-primary scale-110" : "text-slate-500"} />
            {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900" />}
        </button>
        <button onClick={onNavigateCreate} className="bg-gradient-to-br from-primary to-secondary p-3.5 rounded-2xl -mt-12 shadow-2xl shadow-primary/40 transform active:scale-90 transition-all border-4 border-slate-950">
            <PlusSquare size={24} className="text-white" />
        </button>
        <button onClick={onNavigateReels} className="p-2 transition-all active:scale-75">
            <PlayCircle size={24} className={currentView === 'reels' ? "text-primary scale-110" : "text-slate-500"} />
        </button>
        {isAdmin ? (
          <button onClick={onNavigateAdmin} className="p-2 transition-all active:scale-75">
              <Shield size={24} className={currentView === 'admin' ? "text-primary scale-110" : "text-slate-500"} />
          </button>
        ) : (
          <button onClick={onNavigateProfile} className="p-2 transition-all active:scale-75">
              <User size={24} className={currentView === 'profile' ? "text-primary scale-110" : "text-slate-500"} />
          </button>
        )}
      </div>
    </div>
  );
};

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  badge?: number; 
  onClick: () => void 
}> = ({ icon, label, active, badge, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-5 p-3.5 lg:px-5 rounded-2xl cursor-pointer transition-all duration-300 group relative ${
      active ? 'bg-slate-900 text-primary shadow-inner shadow-black/20' : 'hover:bg-slate-900/50 text-slate-500 hover:text-white'
    }`}
  >
    <div className={`group-hover:scale-110 transition-transform relative ${active ? 'text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : ''}`}>
        {icon}
        {badge && (
          <span className="absolute -top-2 -right-2 lg:hidden bg-red-500 text-white text-[9px] font-black min-w-[18px] h-4 px-1 flex items-center justify-center rounded-full border-2 border-slate-950">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
    </div>
    <span className="font-black text-xs uppercase tracking-widest hidden lg:block italic">{label}</span>
    {badge && (
      <span className="ml-auto hidden lg:flex bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full items-center justify-center shadow-lg">
        {badge}
      </span>
    )}
  </div>
);

export default Layout;

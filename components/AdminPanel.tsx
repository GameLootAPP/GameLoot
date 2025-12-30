import React, { useState, useMemo } from 'react';
import { Shield, Users, Image as ImageIcon, Trash2, ArrowLeft, BarChart3, Search, AlertCircle, Flag, MessageSquare, Check, X, Star, Zap, Crown, Activity, Terminal, Gamepad2, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, Post } from '../types';

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const { users, posts, globalReports, adminDeleteUser, adminDeletePost, adminToggleBadge, adminDismissReport, adminBroadcast, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'posts' | 'reports'>('stats');
  const [searchTerm, setSearchTerm] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const userList = useMemo(() => Object.values(users) as User[], [users]);
  
  const filteredUsers = useMemo(() => userList.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [userList, searchTerm]);

  const filteredPosts = useMemo(() => posts.filter(p => 
    p.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
    users[p.userId]?.username.toLowerCase().includes(searchTerm.toLowerCase())
  ), [posts, users, searchTerm]);

  const stats = useMemo(() => ({
    totalUsers: userList.length,
    totalPosts: posts.length,
    totalReports: globalReports.length,
    avgEngagement: posts.length ? (posts.reduce((acc, p) => acc + p.likes, 0) / posts.length).toFixed(1) : "0.0"
  }), [userList, posts, globalReports]);

  const handleBroadcast = (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastMessage.trim()) return;
      adminBroadcast(broadcastMessage);
      setBroadcastMessage('');
      showToast("Global transmission deployed", "success");
  };

  const handlePurgeUser = (userId: string, username: string) => {
    if(confirm(`TERMINATE SIGNAL FOR USER: ${username}?`)) {
        adminDeleteUser(userId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-4 md:pt-8 px-4 pb-32 animate-in fade-in duration-700 relative">
      {/* HUD Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] opacity-20" />

      {/* Header section */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <button 
                onClick={onBack} 
                className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 hover:border-primary/50 group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <Shield className="text-primary animate-pulse" size={20} />
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic truncate">Root Console</h2>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                    <p className="text-[9px] text-primary font-black uppercase tracking-[0.3em]">System Overlord: Active</p>
                </div>
            </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end opacity-40">
            <span className="text-[10px] font-mono text-slate-500">LATENCY: 12ms</span>
            <span className="text-[10px] font-mono text-slate-500">ENCRYPTION: AES-256</span>
        </div>
      </div>

      {/* Modern Sliding Navigation */}
      <div className="relative mb-8 p-1 bg-slate-900/80 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] flex overflow-x-auto no-scrollbar backdrop-blur-xl snap-x">
        <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} icon={<BarChart3 size={16} />} label="System" />
        <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={16} />} label="Gamers" />
        <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<ImageIcon size={16} />} label="Archives" />
        <TabButton active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon={<Flag size={16} />} label="Threats" badge={globalReports.length} />
      </div>

      {/* Animated Content Stage */}
      <div 
        key={activeTab} 
        className="animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
      >
        {/* Universal Filter for lists */}
        {(activeTab === 'users' || activeTab === 'posts') && (
          <div className="relative mb-8 group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-500 group-focus-within:text-primary transition-colors">
                <Search size={18} />
                <span className="w-px h-4 bg-slate-800" />
            </div>
            <input 
              type="text" 
              placeholder={`Search system logs for ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-4 md:py-5 pl-14 pr-6 text-xs md:text-sm font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary transition-all shadow-inner placeholder:text-slate-700"
            />
          </div>
        )}

        {/* STATS VIEW */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard title="Active Signals" value={stats.totalUsers.toString()} icon={<Activity size={20} />} color="text-blue-400" />
              <StatCard title="Drops Logged" value={stats.totalPosts.toString()} icon={<Terminal size={20} />} color="text-purple-400" />
              <StatCard title="Signal Noise" value={stats.totalReports.toString()} icon={<Flag size={20} />} color="text-red-400" />
              <StatCard title="Gamer Flow" value={stats.avgEngagement} icon={<Zap size={20} />} color="text-yellow-400" />
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                <h3 className="text-[11px] md:text-sm font-black text-white uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                    <MessageSquare size={18} className="text-primary" /> Global Signal Injection
                </h3>
                <form onSubmit={handleBroadcast} className="relative flex flex-col gap-4">
                    <textarea 
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Type high-priority transmission to all connected clients..."
                        rows={3}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-4 text-xs md:text-sm text-white focus:outline-none focus:border-primary transition-all resize-none font-medium placeholder:text-slate-800"
                    />
                    <button 
                        type="submit"
                        disabled={!broadcastMessage.trim()}
                        className="bg-primary hover:bg-violet-600 active:scale-95 disabled:opacity-30 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                    >
                        Deploy Signal Transmission
                        <Send size={16} />
                    </button>
                </form>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-6 italic">Warning: This action triggers push-notifications for all active sessions.</p>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.length === 0 ? (
                <EmptyState icon={<Users size={48} />} title="No Signals Found" />
            ) : (
                filteredUsers.map(u => (
                <div key={u.id} className="bg-slate-900/40 border border-slate-800 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-primary/30 transition-all hover:bg-slate-900/60">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className="relative shrink-0">
                        <img src={u.avatarUrl} className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-slate-800 object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center border border-slate-700">
                            {/* Fixed missing icon import Gamepad2 */}
                            <Gamepad2 size={10} className="text-primary" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-white text-base md:text-lg italic uppercase tracking-tighter truncate">{u.username}</span>
                            <div className="flex gap-1">
                                {u.badges.map(b => (
                                    <span key={b} className="text-[7px] md:text-[8px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-black uppercase tracking-tighter border border-slate-700">{b}</span>
                                ))}
                            </div>
                        </div>
                        <span className="text-[10px] md:text-11px text-slate-500 font-bold block truncate mt-1">{u.email} • ID: {u.id.slice(0,8)}</span>
                    </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                        <div className="flex p-1 bg-black/40 rounded-xl gap-1 border border-slate-800/50">
                            <BadgeToggle icon={<Star size={12} />} active={u.badges.includes('Pro')} onClick={() => adminToggleBadge(u.id, 'Pro')} label="PRO" />
                            <BadgeToggle icon={<Zap size={12} />} active={u.badges.includes('Elite')} onClick={() => adminToggleBadge(u.id, 'Elite')} label="ELITE" />
                            <BadgeToggle icon={<Crown size={12} />} active={u.badges.includes('Admin')} onClick={() => adminToggleBadge(u.id, 'Admin')} label="ADMIN" />
                        </div>
                        <div className="w-px h-8 bg-slate-800 mx-1 hidden sm:block" />
                        <button 
                            onClick={() => handlePurgeUser(u.id, u.username)}
                            className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white active:scale-90 transition-all border border-red-500/20 shadow-lg shadow-red-500/5"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
                ))
            )}
          </div>
        )}

        {/* POSTS VIEW */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {filteredPosts.length === 0 ? (
                <div className="col-span-full">
                    <EmptyState icon={<ImageIcon size={48} />} title="Archives Empty" />
                </div>
            ) : (
                filteredPosts.map(p => {
                    const author = users[p.userId];
                    return (
                        <div key={p.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-primary/40 transition-all flex flex-col h-full">
                            <div className="aspect-square bg-black relative shrink-0">
                                {p.mediaType === 'video' ? <video src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" /> : <img src={p.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => { if(confirm("Purge drop from archives?")) adminDeletePost(p.id); }} className="p-4 bg-red-600 text-white rounded-[1.5rem] shadow-2xl active:scale-90 transform hover:scale-110 transition-all">
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-widest">{p.gameTag || 'GENERIC'}</span>
                                        <div className="flex items-center gap-1 text-[8px] font-black text-slate-500">
                                            {/* Fixed missing icon import Heart */}
                                            <Heart size={8} className="fill-slate-500" /> {p.likes}
                                        </div>
                                    </div>
                                    <p className="text-[10px] md:text-xs text-slate-200 line-clamp-2 font-medium mb-4 italic leading-tight">"{p.caption}"</p>
                                </div>
                                <div className="flex items-center gap-3 border-t border-slate-800/50 pt-4">
                                    <img src={author?.avatarUrl} className="w-6 h-6 rounded-full border border-slate-700" alt="" />
                                    <span className="text-[9px] font-black text-slate-400 truncate uppercase tracking-tighter">By @{author?.username}</span>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        )}

        {/* REPORTS VIEW */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            {globalReports.length === 0 ? (
                <div className="py-24 text-center opacity-30">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 border border-slate-800">
                        <Check size={40} className="text-green-500" />
                    </div>
                    <p className="text-[11px] md:text-sm font-black uppercase tracking-[0.4em] text-white">System Signal Clean</p>
                </div>
            ) : (
                globalReports.map(report => {
                    const post = posts.find(p => p.id === report.postId);
                    const reporter = users[report.reporterId];
                    if (!post) return null;
                    return (
                        <div key={report.id} className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-5 md:p-8 flex flex-col md:flex-row items-center gap-6 animate-pulse-slow">
                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden bg-black shrink-0 shadow-2xl border border-red-500/20">
                                {post.mediaType === 'video' ? <video src={post.imageUrl} className="w-full h-full object-cover" /> : <img src={post.imageUrl} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div className="flex-1 text-center md:text-left min-w-0">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full mb-3">
                                    <AlertCircle size={12} className="text-red-500" />
                                    <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">VIOLATION DETECTED: {report.reason}</span>
                                </div>
                                <h4 className="text-sm font-black text-white uppercase tracking-tight mb-2">Transmission Signal Logged</h4>
                                <p className="text-[10px] md:text-xs text-slate-500 mb-4 font-bold uppercase tracking-widest">
                                    Flagged by <span className="text-slate-200">@{reporter?.username}</span> • {new Date(report.timestamp).toLocaleString()}
                                </p>
                                <div className="p-4 bg-black/60 rounded-2xl border border-white/5 text-[11px] md:text-xs text-slate-400 font-medium italic">
                                    "{post.caption}"
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button 
                                    onClick={() => adminDismissReport(report.id)} 
                                    className="flex-1 md:flex-none p-5 bg-slate-800 text-slate-400 hover:text-white rounded-[1.5rem] transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                                >
                                    <X size={20} />
                                    Ignore
                                </button>
                                <button 
                                    onClick={() => adminDeletePost(post.id)} 
                                    className="flex-1 md:flex-none p-5 bg-red-600 text-white rounded-[1.5rem] shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2 text-[10px] font-black uppercase"
                                >
                                    <Trash2 size={20} />
                                    Purge
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }> = ({ active, onClick, icon, label, badge }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-3 px-6 py-4 md:px-8 md:py-5 rounded-[1.2rem] md:rounded-[1.75rem] text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-all shrink-0 snap-center relative ${active ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
        <div className={active ? 'animate-bounce' : ''}>{icon}</div>
        {label}
        {badge !== undefined && badge > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-red-500 text-white text-[9px] rounded-full border-2 border-slate-900 shadow-lg animate-bounce">
                {badge}
            </span>
        )}
        {active && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white rounded-full shadow-[0_0_8px_white]" />
        )}
    </button>
);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-slate-900/40 border border-slate-800 p-6 md:p-8 rounded-[2rem] flex flex-col items-center justify-center text-center shadow-2xl hover:border-primary/20 transition-all group relative overflow-hidden">
    <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/5 blur-2xl rounded-full group-hover:bg-primary/10 transition-colors" />
    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.2rem] md:rounded-[1.5rem] bg-slate-950 flex items-center justify-center mb-4 md:mb-5 shadow-inner border border-slate-800 group-hover:scale-110 transition-transform ${color}`}>
      {icon}
    </div>
    <div className="text-2xl md:text-3xl font-black text-white tracking-tighter italic mb-1 uppercase">{value}</div>
    <div className="text-[8px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.3em]">{title}</div>
  </div>
);

const BadgeToggle: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-tighter transition-all border shrink-0 ${active ? 'bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/5' : 'bg-slate-950 border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700'}`}
    >
        {icon}
        <span className="hidden xs:block">{label}</span>
    </button>
);

const EmptyState: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
    <div className="py-32 text-center opacity-30 flex flex-col items-center justify-center">
        <div className="mb-6 p-10 bg-slate-900/50 rounded-[3rem] border border-slate-800">
            {icon}
        </div>
        <p className="text-sm font-black uppercase tracking-[0.5em] text-white italic">{title}</p>
    </div>
);

const Send = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
);

export default AdminPanel;
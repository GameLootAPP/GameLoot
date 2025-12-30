import React, { useState } from 'react';
import { ArrowLeft, Shield, Bell, Eye, Database, LogOut, ChevronRight, Trash2, Github, UserX, CheckCircle, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SettingsProps {
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { currentUser, updatePreferences, logout, clearAppData, showToast, getUser, toggleBlockUser } = useApp();
  const [subView, setSubView] = useState<'main' | 'blocked'>('main');
  
  if (!currentUser) return null;

  const prefs = currentUser.preferences || {
    privateAccount: false,
    showGameTags: true,
    emailNotifications: true,
    pushNotifications: true
  };

  const handleToggle = (key: string, value: boolean) => {
      updatePreferences({ [key]: value });
  };

  const handleClearData = () => {
      if (confirm("DANGER: This will wipe all local data and log you out. Are you absolutely sure?")) {
          clearAppData();
      }
  };

  if (subView === 'blocked') {
      const blockedIds = currentUser.blockedUserIds || [];
      return (
          <div className="max-w-xl mx-auto pt-6 px-4 pb-20 animate-in slide-in-from-right duration-500">
              <div className="flex items-center gap-5 mb-10">
                <button onClick={() => setSubView('main')} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:scale-105">
                    <ArrowLeft size={22} />
                </button>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Ban List</h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Managed Blocked Gamers</p>
                </div>
              </div>
              
              <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden divide-y divide-slate-800 shadow-2xl">
                  {blockedIds.length === 0 ? (
                      <div className="p-16 text-center text-slate-500">
                          <UserX size={48} className="mx-auto mb-6 opacity-10" />
                          <p className="font-bold text-sm text-slate-600">NO ACTIVE BANS</p>
                      </div>
                  ) : (
                      blockedIds.map(id => {
                          const user = getUser(id);
                          if (!user) return null;
                          return (
                              <div key={id} className="flex items-center justify-between p-5 hover:bg-slate-800/50 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <img src={user.avatarUrl} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                                      <div>
                                        <span className="font-black text-white text-sm block">{user.username}</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.displayName}</span>
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => toggleBlockUser(id)}
                                    className="text-xs font-black text-red-500 hover:bg-red-500/10 px-4 py-2.5 rounded-xl border border-red-500/20 transition-all active:scale-95"
                                  >
                                      UNBAN
                                  </button>
                              </div>
                          );
                      })
                  )}
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto pt-6 px-4 pb-24 animate-in slide-in-from-right duration-500">
      <div className="flex items-center gap-5 mb-10">
        <button onClick={onBack} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:scale-105">
            <ArrowLeft size={22} />
        </button>
        <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Loot Settings</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure your HUD & Gear</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Account Section */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.3em]">Privacy & Stealth</h3>
            <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <SettingToggle 
                    icon={<Shield size={20} className="text-blue-400" />}
                    label="Ghost Mode"
                    description="Hide your drops from non-followers"
                    isEnabled={prefs.privateAccount}
                    onToggle={(val) => handleToggle('privateAccount', val)}
                />
                <div className="h-px bg-slate-800 mx-5" />
                <SettingItem 
                    icon={<UserX size={20} className="text-red-400" />}
                    label="Active Ban List"
                    description={`${currentUser.blockedUserIds?.length || 0} gamers restricted`}
                    onClick={() => setSubView('blocked')}
                />
            </div>
        </div>

        {/* Preferences */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.3em]">Interface Config</h3>
            <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <SettingToggle 
                    icon={<Github size={20} className="text-primary" />} 
                    label="Stream Metadata"
                    description="Show game tags on feed items"
                    isEnabled={prefs.showGameTags}
                    onToggle={(val) => handleToggle('showGameTags', val)}
                />
            </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.3em]">Communication Pings</h3>
            <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <SettingToggle 
                    icon={<Bell size={20} className="text-yellow-400" />}
                    label="Priority Alerts"
                    description="Mobile pings for GGs & comments"
                    isEnabled={prefs.pushNotifications}
                    onToggle={(val) => handleToggle('pushNotifications', val)}
                />
                <div className="h-px bg-slate-800 mx-5" />
                <SettingToggle 
                    icon={<Bell size={20} className="text-slate-500" />}
                    label="Email Logs"
                    description="Weekly digests & security pings"
                    isEnabled={prefs.emailNotifications}
                    onToggle={(val) => handleToggle('emailNotifications', val)}
                />
            </div>
        </div>

        {/* Data & Storage */}
        <div className="space-y-3">
            <h3 className="text-[10px] font-black text-slate-500 uppercase px-3 mb-4 tracking-[0.3em]">System Management</h3>
            <div className="bg-surface border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <SettingItem 
                    icon={<Database size={20} className="text-purple-400" />}
                    label="Vault Statistics"
                    description="12 drops | 4 clips | 18.5MB used"
                    onClick={() => showToast("Storage analysis coming soon!", "info")}
                />
                <div className="h-px bg-slate-800 mx-5" />
                <button 
                    onClick={handleClearData}
                    className="w-full flex items-center justify-between p-5 hover:bg-red-500/5 transition-all group"
                >
                    <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500/20 transition-all border border-red-500/10">
                            <Trash2 size={22} />
                        </div>
                        <div className="text-left">
                            <div className="font-black text-red-500 text-sm uppercase tracking-tighter">Purge Local Storage</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Permanent data wipe</div>
                        </div>
                    </div>
                </button>
            </div>
        </div>

        {/* Logout */}
        <button 
            onClick={logout}
            className="w-full bg-slate-900 border border-slate-800 hover:bg-red-950/20 hover:border-red-900 text-red-500 font-black py-5 rounded-3xl transition-all flex items-center justify-center gap-4 mt-12 shadow-2xl active:scale-[0.98] group"
        >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            <span className="uppercase tracking-[0.2em] text-xs">Terminate Session</span>
        </button>

        <div className="text-center py-12 opacity-30 select-none">
            <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle size={10} className="text-green-500" />
                <p className="text-[10px] font-black tracking-[0.4em] uppercase">Status: Connected</p>
            </div>
            <p className="text-[10px] font-bold">LootDrop Core v1.5.0-STABLE</p>
            <p className="text-[9px] mt-1 font-medium italic opacity-60">Optimized for Gaming Enthusiasts</p>
        </div>
      </div>
    </div>
  );
};

const SettingToggle: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    description?: string; 
    isEnabled: boolean; 
    onToggle: (val: boolean) => void 
}> = ({ icon, label, description, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between p-5 hover:bg-slate-800/40 transition-all cursor-pointer group" onClick={() => onToggle(!isEnabled)}>
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 transition-colors shadow-inner">
                {icon}
            </div>
            <div>
                <div className="font-black text-slate-100 text-sm tracking-tight">{label}</div>
                {description && <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{description}</div>}
            </div>
        </div>
        <button 
            onClick={(e) => { e.stopPropagation(); onToggle(!isEnabled); }}
            className={`w-14 h-7 rounded-full transition-all relative ${isEnabled ? 'bg-primary shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'bg-slate-700'}`}
        >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg transition-all duration-300 ${isEnabled ? 'left-8' : 'left-1'}`} />
        </button>
    </div>
);

const SettingItem: React.FC<{ 
    icon: React.ReactNode; 
    label: string; 
    description?: string; 
    onClick?: () => void 
}> = ({ icon, label, description, onClick }) => (
    <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-5 hover:bg-slate-800/40 transition-all group"
    >
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 transition-colors shadow-inner">
                {icon}
            </div>
            <div className="text-left">
                <div className="font-black text-slate-100 text-sm tracking-tight">{label}</div>
                {description && <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">{description}</div>}
            </div>
        </div>
        <ChevronRight size={18} className="text-slate-700 group-hover:text-white group-hover:translate-x-1.5 transition-all" />
    </button>
);

export default Settings;
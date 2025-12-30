
import React, { useState } from 'react';
import { Grid, Settings, MessageSquare, UserCheck, UserPlus, Play, Bookmark, UserX, Shield, Gamepad2, Trophy, Users, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProfileProps {
  userId: string;
  onPostClick?: (postId: string) => void;
  onEditProfile?: () => void;
  onSettingsClick?: () => void;
  onMessageClick?: (userId: string) => void;
}

const Profile: React.FC<ProfileProps> = ({ userId, onPostClick, onEditProfile, onSettingsClick, onMessageClick }) => {
  const { getUser, posts, currentUser, toggleFollow, isFollowing, toggleBlockUser, isUserBlocked, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved'>('posts');
  
  const user = getUser(userId);
  const userPosts = posts.filter(p => p.userId === userId).sort((a,b) => b.timestamp - a.timestamp);
  
  const savedPostIds = user?.savedPostIds || [];
  const savedPosts = posts.filter(p => savedPostIds.includes(p.id)).sort((a,b) => b.timestamp - a.timestamp);
  
  if (!currentUser) return null; 

  const isCurrentUser = currentUser.id === userId;
  const amIFollowing = isFollowing(userId);
  const amIBlocking = isUserBlocked(userId);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-slate-800 shadow-2xl">
          <UserX size={40} className="text-slate-600" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gamer Not Found</h2>
        <p className="text-slate-500 mt-2 max-w-xs">This user might have been banned or the link is broken.</p>
      </div>
    );
  }

  const handleMessage = () => {
    if (onMessageClick) {
      onMessageClick(userId);
    } else {
      showToast(`Direct messaging is currently offline for maintenance`, 'error');
    }
  }

  const displayedPosts = activeTab === 'posts' ? userPosts : savedPosts;

  return (
    <div className="pb-24 md:pb-12 animate-in fade-in duration-500">
      {/* Profile Header Container */}
      <div className="relative border-b border-slate-800/60 bg-slate-950/20">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-6 py-8 md:py-16">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 relative z-10">
            
            {/* Avatar Section */}
            <div className="relative shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 animate-pulse" />
                <div className="relative p-1.5 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
                  <img 
                      src={user.avatarUrl} 
                      alt={user.username} 
                      className="w-32 h-32 md:w-48 md:h-48 rounded-[2.2rem] object-cover border-2 border-slate-800 shadow-inner hover:scale-105 transition-transform duration-500" 
                  />
                  {user.badges.includes('Pro') && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[9px] font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-lg whitespace-nowrap">
                        PRO ELITE
                    </div>
                  )}
                </div>
            </div>

            {/* Info & Stats Section */}
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-3">
                  <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic">{user.username}</h2>
                  <div className="flex gap-3">
                    {user.preferences?.privateAccount && <Shield size={18} className="text-slate-500" />}
                    {isCurrentUser && (
                      <button 
                        onClick={onSettingsClick}
                        className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all hover:rotate-90"
                      >
                        <Settings size={20} className="text-slate-400" />
                      </button>
                    )}
                  </div>
              </div>

              {/* Badges Row */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                  {user.badges.map(badge => (
                      <span key={badge} className="text-[10px] uppercase font-black tracking-widest bg-slate-800/40 backdrop-blur-md text-slate-400 px-4 py-2 rounded-xl border border-slate-700/50">
                          {badge}
                      </span>
                  ))}
                  {user.mainGame && (
                    <span className="text-[10px] uppercase font-black tracking-widest bg-primary/10 backdrop-blur-md text-primary px-4 py-2 rounded-xl border border-primary/20">
                      {user.mainGame}
                    </span>
                  )}
              </div>

              {/* Stats HUD */}
              <div className="grid grid-cols-3 gap-1 md:gap-16 py-6 mb-8 border-y border-slate-800/40 w-full md:w-auto">
                  <div className="flex flex-col items-center md:items-start px-4 md:px-0">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-primary" />
                        <span className="font-black text-white text-xl md:text-3xl tracking-tighter">{userPosts.length}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Drops</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start px-4 md:px-0 border-x border-slate-800/40 md:border-none">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-secondary" />
                        <span className="font-black text-white text-xl md:text-3xl tracking-tighter">{user.followers >= 1000 ? (user.followers/1000).toFixed(1) + 'K' : user.followers}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Fans</span>
                  </div>
                  <div className="flex flex-col items-center md:items-start px-4 md:px-0">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-slate-400" />
                        <span className="font-black text-white text-xl md:text-3xl tracking-tighter">{user.following}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Watching</span>
                  </div>
              </div>

              {/* Bio */}
              <div className="mb-10 max-w-xl">
                  <h3 className="text-white font-black text-lg uppercase tracking-tight mb-2">{user.displayName}</h3>
                  <p className="text-slate-400 text-base leading-relaxed font-medium">
                      {user.bio}
                  </p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 w-full md:w-auto">
                  {isCurrentUser ? (
                      <button 
                          onClick={onEditProfile}
                          className="flex-1 md:flex-none md:min-w-[240px] bg-white text-slate-950 hover:bg-slate-200 font-black py-5 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 text-xs tracking-[0.2em] shadow-xl shadow-white/5"
                      >
                          CONFIGURE PROFILE
                      </button>
                  ) : (
                      <>
                          <button 
                              onClick={() => toggleFollow(userId)}
                              className={`flex-1 md:flex-none md:min-w-[180px] font-black py-5 rounded-3xl transition-all hover:scale-[1.02] active:scale-95 text-xs tracking-[0.2em] flex items-center justify-center gap-3 shadow-lg ${
                                  amIFollowing 
                                  ? 'bg-slate-800 text-white hover:bg-slate-700' 
                                  : 'bg-primary text-white hover:bg-violet-600 shadow-primary/20'
                              }`}
                          >
                              {amIFollowing ? <><UserCheck size={18}/> FOLLOWING</> : <><UserPlus size={18}/> FOLLOW GAMER</>}
                          </button>
                          <button 
                              onClick={handleMessage}
                              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white p-5 rounded-3xl transition-all hover:scale-110"
                          >
                              <MessageSquare size={22} />
                          </button>
                      </>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto flex justify-center">
            <button 
                onClick={() => setActiveTab('posts')}
                className={`flex-1 max-w-[280px] flex items-center justify-center gap-4 py-6 border-b-2 transition-all font-black text-[11px] uppercase tracking-[0.3em] ${activeTab === 'posts' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
                <Grid size={18} />
                Drops Vault
            </button>
            {isCurrentUser && (
                <button 
                    onClick={() => setActiveTab('saved')}
                    className={`flex-1 max-w-[280px] flex items-center justify-center gap-4 py-6 border-b-2 transition-all font-black text-[11px] uppercase tracking-[0.3em] ${activeTab === 'saved' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                >
                    <Bookmark size={18} />
                    Saved Loot
                </button>
            )}
        </div>
      </div>

      {/* Drops Grid */}
      <div className="max-w-6xl mx-auto p-4 md:p-12">
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-8">
            {displayedPosts.map(post => (
                <div 
                    key={post.id} 
                    className="relative aspect-square group cursor-pointer bg-slate-900 overflow-hidden rounded-xl md:rounded-[2.5rem] border border-slate-800/50 hover:border-primary/50 transition-all duration-500"
                    onClick={() => onPostClick?.(post.id)}
                >
                    {post.mediaType === 'video' ? (
                        <>
                            <video src={post.imageUrl} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" muted playsInline />
                            <div className="absolute top-4 right-4 z-10 p-2.5 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                                <Play size={14} className="text-white fill-white" />
                            </div>
                        </>
                    ) : (
                        <img src={post.imageUrl} alt="Drop" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-8 z-20">
                        <div className="flex items-center gap-6 text-white font-black text-sm tracking-tighter">
                            <span className="flex items-center gap-2">
                                <span className="text-red-500">❤️</span> {post.likes}
                            </span>
                            <span className="flex items-center gap-2">
                                <span className="text-blue-400">💬</span> {post.comments.length}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {displayedPosts.length === 0 && (
            <div className="py-40 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-slate-700 shadow-3xl">
                   <Gamepad2 size={48} />
                </div>
                <h3 className="text-slate-400 font-black uppercase tracking-[0.4em] text-base">Inventory Depleted</h3>
                <p className="text-slate-600 text-sm mt-4 font-bold uppercase tracking-widest">{activeTab === 'posts' ? 'Share your first drop to fill the vault.' : 'No saved loot found.'}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

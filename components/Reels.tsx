import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Heart, MessageCircle, Bookmark, Music, Gamepad2, X, Send, Trash2, Flag, MoreVertical, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Post, User } from '../types';

interface ReelsProps {
  onUserClick: (userId: string) => void;
}

const Reels: React.FC<ReelsProps> = ({ onUserClick }) => {
  const { posts, isUserBlocked, currentUser } = useApp();
  const [isMutedGlobal, setIsMutedGlobal] = useState(true);
  
  const videoPosts = useMemo(() => {
    return posts.filter(p => 
      p.mediaType === 'video' && 
      !isUserBlocked(p.userId) && 
      !currentUser?.reportedPostIds?.includes(p.id)
    ).sort((a, b) => b.timestamp - a.timestamp);
  }, [posts, isUserBlocked, currentUser]);

  const toggleGlobalMute = () => {
      setIsMutedGlobal(!isMutedGlobal);
  };

  if (videoPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-950 text-center p-6 animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border border-slate-800">
            <Gamepad2 size={44} className="text-slate-700 animate-pulse" />
        </div>
        <h2 className="text-xl font-black text-white uppercase tracking-tighter">No Clips In Orbit</h2>
        <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest max-w-xs">The clips vault is currently empty. Be the first to drop one in the shared grid!</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar relative scroll-smooth">
      {/* Mute Toggle - Floating */}
      <button 
        onClick={toggleGlobalMute}
        className="fixed top-6 right-6 z-[120] p-3 md:p-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl text-white hover:bg-black/60 transition-all transform active:scale-90 shadow-2xl"
      >
        {isMutedGlobal ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
      </button>

      <div className="max-w-md md:max-w-lg lg:max-w-xl mx-auto h-full relative border-x border-slate-800/50 shadow-2xl bg-black">
          {videoPosts.map((post) => (
            <ReelItem key={post.id} post={post} onUserClick={onUserClick} isMutedGlobal={isMutedGlobal} />
          ))}
          
          {/* Tablet/Desktop Scroll Hint */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-50 animate-bounce pointer-events-none">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white">Next Clip</span>
            <ChevronDown size={20} className="text-white" />
          </div>
      </div>
    </div>
  );
};

interface ReelItemProps {
  post: Post;
  onUserClick: (userId: string) => void;
  isMutedGlobal: boolean;
}

const ReelItem: React.FC<ReelItemProps> = ({ post, onUserClick, isMutedGlobal }) => {
  const { toggleLike, toggleSavePost, isPostSaved, getUser, currentUser, addComment, deleteComment, showToast, reportPost, toggleFollow, isFollowing } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  
  const author = getUser(post.userId);
  const saved = isPostSaved(post.id);
  const following = author ? isFollowing(author.id) : false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.8 }
    );

    if (reelRef.current) observer.observe(reelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isVisible) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      // On tablets, don't reset to 0 to keep the "continue" feel when scrolling back
      // videoRef.current.currentTime = 0; 
    }
  }, [isVisible]);

  const handleDoubleTap = () => {
    if (!post.likedByCurrentUser) {
      toggleLike(post.id);
      setIsLiking(true);
      setTimeout(() => setIsLiking(false), 1000);
    }
  };

  const handleReport = () => {
      if (confirm("Report this clip for community guideline violations?")) {
          // Fix: Added missing second argument 'reason' required by reportPost
          reportPost(post.id, "Community Guideline Violation");
          setShowOptions(false);
      }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    showToast("Comm broadcasted!", "success");
  };

  if (!author) return null;

  return (
    <div ref={reelRef} className="h-full w-full snap-start relative flex flex-col justify-end bg-black overflow-hidden group/reel" onDoubleClick={handleDoubleTap}>
      <video 
        ref={videoRef} 
        src={post.imageUrl} 
        className="absolute inset-0 w-full h-full object-cover" 
        loop 
        playsInline 
        muted={isMutedGlobal} 
      />
      
      {isLiking && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
           <Heart size={120} fill="white" className="text-white animate-ping opacity-80" />
        </div>
      )}

      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
      
      <div className="relative z-10 flex flex-row items-end justify-between p-6 pb-24 md:pb-12 gap-6">
        <div className="flex-1 space-y-4 animate-in slide-in-from-left duration-700">
            <div className="flex items-center gap-4">
                <div className="relative cursor-pointer group" onClick={() => onUserClick(author.id)}>
                    <img src={author.avatarUrl} className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-primary/40 shadow-xl group-hover:scale-110 transition-transform object-cover" alt={author.username} />
                    <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-black">
                        <Gamepad2 size={10} className="text-white" />
                    </div>
                </div>
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-white text-sm md:text-base drop-shadow-xl cursor-pointer truncate hover:text-primary transition-colors" onClick={() => onUserClick(author.id)}>@{author.username}</span>
                      {author.badges.includes('Pro') && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded font-black tracking-tighter">PRO</span>}
                    </div>
                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">{new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
                {!following && author.id !== currentUser?.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleFollow(author.id); }} 
                    className="bg-primary hover:bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-xl border border-primary/30 transition-all shadow-lg active:scale-95 ml-2 shrink-0"
                  >
                    Follow
                  </button>
                )}
            </div>
            
            <p className="text-white text-sm md:text-base font-medium leading-relaxed max-w-[90%] drop-shadow-lg line-clamp-3 md:line-clamp-none">{post.caption}</p>
            
            {post.gameTag && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 w-fit px-4 py-2 rounded-2xl shadow-2xl">
                    <Gamepad2 size={14} className="text-primary" />
                    <span className="text-[10px] md:text-[11px] font-black uppercase text-white tracking-widest">{post.gameTag}</span>
                </div>
            )}
            
            <div className="flex items-center gap-3 text-white/50 bg-black/20 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm group-hover/reel:bg-black/40 transition-colors">
                <Music size={12} className="animate-spin duration-[5000ms]" />
                <span className="text-[9px] md:text-[10px] font-bold tracking-tighter overflow-hidden whitespace-nowrap">Broadcast Sync Alpha 1.0</span>
            </div>
        </div>

        {/* Vertical Action Bar */}
        <div className="flex flex-col items-center gap-7 md:gap-8 animate-in slide-in-from-right duration-700">
            <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => toggleLike(post.id)} 
                  className={`p-4 md:p-5 rounded-[1.75rem] transition-all active:scale-75 shadow-2xl ${post.likedByCurrentUser ? 'bg-red-500 text-white' : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60'}`}
                >
                    <Heart size={28} className={post.likedByCurrentUser ? 'fill-white' : ''} />
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">{post.likes.toLocaleString()}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => setShowComments(true)} 
                  className="p-4 md:p-5 rounded-[1.75rem] bg-black/40 backdrop-blur-xl border border-white/10 text-white transition-all active:scale-75 shadow-2xl hover:bg-black/60"
                >
                    <MessageCircle size={28} />
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">{post.comments.length}</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
                <button 
                  onClick={() => toggleSavePost(post.id)} 
                  className={`p-4 md:p-5 rounded-[1.75rem] transition-all active:scale-75 shadow-2xl ${saved ? 'bg-primary text-white' : 'bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60'}`}
                >
                    <Bookmark size={28} className={saved ? 'fill-white' : ''} />
                </button>
                <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-md">{saved ? 'LOOTED' : 'LOOT'}</span>
            </div>
            
            <button 
              onClick={() => setShowOptions(!showOptions)} 
              className="p-4 md:p-5 rounded-[1.75rem] bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-black/60 transition-all shadow-2xl"
            >
                <MoreVertical size={28} />
            </button>
        </div>
      </div>

      {/* Options Menu */}
      {showOptions && (
        <div className="absolute bottom-32 right-24 md:bottom-36 md:right-32 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-2 z-[130] animate-in zoom-in duration-200 shadow-3xl">
            <button onClick={handleReport} className="flex items-center gap-4 px-6 py-4 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 rounded-2xl w-full transition-colors whitespace-nowrap">
                <Flag size={18} /> Report Signal
            </button>
        </div>
      )}

      {/* Comments Drawer */}
      {showComments && (
        <div className="absolute inset-x-0 bottom-0 h-[75%] md:h-[65%] bg-slate-950/98 backdrop-blur-3xl z-[150] rounded-t-[3rem] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom duration-500 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
            <div className="w-16 h-1.5 bg-white/20 rounded-full mx-auto mt-4 mb-2 shrink-0" />
            
            <div className="flex items-center justify-between p-6 lg:p-10 pt-4">
                <h3 className="font-black text-white uppercase tracking-[0.2em] text-[11px]">Signal Transmissions ({post.comments.length})</h3>
                <button 
                  onClick={() => setShowComments(false)} 
                  className="text-slate-500 hover:text-white p-3 bg-white/5 rounded-full transition-all hover:scale-110 active:scale-90"
                >
                  <X size={24} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 lg:px-10 pb-6 space-y-6 lg:space-y-8 no-scrollbar">
                {post.comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                        <MessageCircle size={48} className="text-slate-600 mb-6" />
                        <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.3em]">No transmissions logged</p>
                    </div>
                ) : (
                    post.comments.map(comment => (
                        <div key={comment.id} className="flex gap-4 lg:gap-6 group/comment animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="w-11 h-11 rounded-full bg-slate-800 shrink-0 overflow-hidden border border-white/10">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-sm font-black text-white tracking-tight truncate">{comment.username}</span>
                                    <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest shrink-0">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className="text-sm text-slate-300 leading-relaxed font-medium break-words">{comment.text}</p>
                            </div>
                            {comment.userId === currentUser?.id && (
                                <button onClick={() => deleteComment(post.id, comment.id)} className="text-red-500 opacity-0 group-hover/comment:opacity-100 transition-all p-2 hover:bg-red-500/10 rounded-xl shrink-0"><Trash2 size={18} /></button>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <form onSubmit={handleCommentSubmit} className="p-6 lg:p-10 bg-black/40 border-t border-white/5 flex items-center gap-5 backdrop-blur-xl">
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 hidden sm:block border border-white/10">
                    <img src={currentUser?.avatarUrl} className="w-full h-full object-cover" alt="" />
                </div>
                <input 
                    type="text" 
                    value={commentText} 
                    onChange={(e) => setCommentText(e.target.value)} 
                    placeholder="Broadcast your reaction..." 
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 lg:px-6 lg:py-5 text-sm text-white focus:outline-none focus:border-primary transition-all font-medium placeholder:text-slate-600 shadow-inner" 
                />
                <button 
                    type="submit" 
                    disabled={!commentText.trim()} 
                    className="p-4 lg:p-5 bg-primary text-white rounded-2xl disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center justify-center shrink-0"
                >
                    <Send size={22} />
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

export default Reels;
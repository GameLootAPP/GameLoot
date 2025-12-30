
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Play, X, Share2, AlertTriangle, Flag, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Post, User } from '../types';
import { useApp } from '../context/AppContext';

interface PostCardProps {
  post: Post;
  author?: User;
  onUserClick: (userId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, onUserClick }) => {
  const { toggleLike, addComment, deleteComment, currentUser, deletePost, adminDeletePost, showToast, toggleSavePost, isPostSaved, reportPost } = useApp();
  const [commentText, setCommentText] = useState('');
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isHeartButtonAnimating, setIsHeartButtonAnimating] = useState(false);
  const [isCountAnimating, setIsCountAnimating] = useState(false);
  const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReportMenu, setShowReportMenu] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser?.email === "chmielp41@gmail.com";
  const isOwner = currentUser?.id === post.userId;

  useEffect(() => {
    if (post.mediaType === 'video' && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
    }
  }, [post.mediaType]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!author) return null;

  const handleLike = () => {
    if (!post.likedByCurrentUser) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
    }
    setIsHeartButtonAnimating(true);
    setIsCountAnimating(true);
    setTimeout(() => setIsHeartButtonAnimating(false), 350);
    setTimeout(() => setIsCountAnimating(false), 300);
    toggleLike(post.id);
  };

  const handleBookmark = () => {
    setIsBookmarkAnimating(true);
    setTimeout(() => setIsBookmarkAnimating(false), 350);
    toggleSavePost(post.id);
  };

  const handleReport = (reason: string) => {
    reportPost(post.id, reason);
    setShowReportMenu(false);
    setShowMenu(false);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(post.id, commentText);
    setCommentText('');
    showToast("GG! Comment dropped", "success");
  };

  const handleDeleteComment = (commentId: string) => {
      if (confirm("Delete your comment?")) {
          deleteComment(post.id, commentId);
      }
  };

  const togglePlay = () => {
      if (post.mediaType === 'video' && videoRef.current) {
          if (videoRef.current.paused) {
              videoRef.current.play();
              setIsPlaying(true);
          } else {
              videoRef.current.pause();
              setIsPlaying(false);
          }
      }
  };

  const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "info");
      setShowMenu(false);
  };

  const initiateDelete = () => {
      setShowMenu(false);
      setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
      if (isAdmin && !isOwner) {
          adminDeletePost(post.id);
      } else {
          deletePost(post.id);
      }
      setShowDeleteConfirm(false);
  };

  const saved = isPostSaved(post.id);

  const reportReasons = ["Spam", "Toxic Behavior", "Cheating/Macros", "Harassment", "Hate Speech"];

  return (
    <article className="bg-surface md:rounded-2xl overflow-hidden mb-6 border-b md:border border-slate-800 relative animate-in fade-in duration-500">
      
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center max-w-xs">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                    {isAdmin ? <ShieldAlert size={32} className="text-red-500" /> : <AlertTriangle size={32} className="text-red-500" />}
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">
                  {isAdmin && !isOwner ? 'ADMIN PURGE' : 'De-Orbit This Drop?'}
                </h3>
                <p className="text-slate-400 text-xs font-medium mb-8">
                  {isAdmin && !isOwner 
                    ? 'As an administrator, you are about to purge this content from the global grid. This is irreversible.' 
                    : 'This action is permanent and cannot be rolled back. The clip will be purged from the archives.'}
                </p>
                <div className="flex flex-col gap-3">
                    <button onClick={confirmDelete} className="bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg shadow-red-500/20">
                      {isAdmin && !isOwner ? 'FORCE PURGE' : 'Confirm Deletion'}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(false)} className="bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all">Abort</button>
                </div>
            </div>
        </div>
      )}

      {showReportMenu && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-200">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-3 mb-6 text-red-500">
                    <ShieldAlert size={28} />
                    <h3 className="text-xl font-black uppercase tracking-tighter">Signal Violation</h3>
                </div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">Select reason for transmission error:</p>
                <div className="space-y-3">
                    {reportReasons.map(reason => (
                        <button 
                            key={reason}
                            onClick={() => handleReport(reason)}
                            className="w-full bg-slate-900 border border-slate-800 hover:border-red-500/50 hover:bg-red-500/5 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all text-left px-6 flex justify-between items-center group"
                        >
                            {reason}
                            <div className="w-2 h-2 rounded-full bg-slate-800 group-hover:bg-red-500 transition-colors" />
                        </button>
                    ))}
                    <button onClick={() => setShowReportMenu(false)} className="w-full text-slate-500 font-black py-4 text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors">Cancel Report</button>
                </div>
            </div>
        </div>
      )}

      <div className="p-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(author.id)}>
          <img src={author.avatarUrl} alt={author.username} className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent hover:ring-primary transition-all" />
          <div>
            <div className="flex items-center gap-1">
                <span className="font-semibold text-white">{author.username}</span>
                {author.badges.includes('Pro') && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded font-black tracking-tighter">PRO</span>}
                {author.email === "chmielp41@gmail.com" && <ShieldCheck size={14} className="text-primary animate-pulse ml-0.5" />}
            </div>
            {post.gameTag && <p className="text-[10px] font-black uppercase tracking-widest text-primary/80">{post.gameTag}</p>}
          </div>
        </div>
        
        <div className="relative" ref={menuRef}>
            <button className="text-slate-400 hover:text-white p-2 transition-colors" onClick={() => setShowMenu(!showMenu)}>
                <MoreHorizontal size={20} />
            </button>
            
            {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-40 py-2 animate-in slide-in-from-top-2 duration-200">
                    <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <Share2 size={16} />
                        Copy Link
                    </button>
                    <button onClick={handleBookmark} className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <Bookmark size={16} className={saved ? "text-primary fill-primary" : ""} />
                        {saved ? 'Unsave Loot' : 'Save Loot'}
                    </button>
                    
                    {!isOwner && (
                        <button onClick={() => { setShowReportMenu(true); setShowMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors">
                            <Flag size={16} />
                            Report Drop
                        </button>
                    )}

                    {(isOwner || isAdmin) && (
                        <>
                            <div className="h-px bg-slate-800 my-1 mx-2" />
                            <button onClick={initiateDelete} className="w-full flex items-center gap-3 px-4 py-3 text-left text-xs font-black text-red-500 hover:bg-red-500/10 transition-colors">
                                <Trash2 size={16} />
                                {isAdmin && !isOwner ? 'ADMIN DELETE' : 'DELETE DROP'}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="relative aspect-square bg-black group overflow-hidden" onClick={togglePlay}>
        {post.mediaType === 'video' ? (
            <video ref={videoRef} src={post.imageUrl} className="w-full h-full object-cover" loop muted={isMuted} playsInline />
        ) : (
            <img src={post.imageUrl} alt={post.caption} className="w-full h-full object-cover" />
        )}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 z-30 ${isLikeAnimating ? 'opacity-100' : 'opacity-0'}`}>
            <Heart fill="white" className="text-white w-24 h-24 animate-bounce" />
        </div>
        {post.mediaType === 'video' && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <Play size={48} className="text-white/50 fill-white/20" />
            </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <div className="flex gap-4">
            <button onClick={handleLike} className={`transition-all active:scale-90 hover:text-red-500 ${isHeartButtonAnimating ? 'animate-pop' : ''}`}>
                <Heart size={28} className={post.likedByCurrentUser ? "text-red-500 fill-red-500" : "text-white"} />
            </button>
            <button className="hover:text-primary transition-colors" onClick={() => setShowAllComments(!showAllComments)}>
                <MessageCircle size={28} />
            </button>
            <button className="hover:text-primary transition-colors" onClick={handleShare}>
                <Send size={28} />
            </button>
          </div>
          <button onClick={handleBookmark} className={`transition-all active:scale-90 hover:text-primary ${isBookmarkAnimating ? 'animate-pop' : ''}`}>
            <Bookmark size={28} className={saved ? "text-primary fill-primary" : "text-white"} />
          </button>
        </div>

        <div className={`font-black text-white mb-2 tracking-tighter ${isCountAnimating ? 'animate-count-pop' : ''}`}>
            {post.likes.toLocaleString()} GGs
        </div>

        <div className="mb-4">
          <span className="font-black mr-2 cursor-pointer hover:text-primary transition-colors" onClick={() => onUserClick(author.id)}>
            {author.username}
          </span>
          <span className="text-slate-300 text-sm leading-relaxed">{post.caption}</span>
        </div>

        <div className="space-y-2">
            {post.comments.length > 0 && (
                <button onClick={() => setShowAllComments(!showAllComments)} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-400 transition-colors mb-2">
                    {showAllComments ? 'Minimize Comms' : `View all ${post.comments.length} transmissions`}
                </button>
            )}

            <div className={`space-y-2 overflow-hidden transition-all duration-300 ${showAllComments ? 'max-h-[300px] overflow-y-auto custom-scrollbar pr-2' : 'max-h-[80px]'}`}>
                {(showAllComments ? post.comments : post.comments.slice(-2)).map(comment => (
                    <div key={comment.id} className="flex justify-between items-start text-sm group/comment bg-slate-800/20 p-2 rounded-lg border border-transparent hover:border-slate-700/50 transition-all">
                        <div className="flex-1">
                            <span className="font-bold mr-2 text-slate-200">{comment.username}</span>
                            <span className="text-slate-400 text-xs">{comment.text}</span>
                        </div>
                        {(comment.userId === currentUser?.id || isAdmin) && (
                            <button onClick={() => handleDeleteComment(comment.id)} className="opacity-0 group-hover/comment:opacity-100 text-red-500 p-1 hover:bg-red-500/10 rounded transition-all">
                                <Trash2 size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        <form onSubmit={handleSubmitComment} className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-800/50">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-slate-700">
                <img src={currentUser?.avatarUrl} className="w-full h-full object-cover" alt="Me" />
            </div>
            <input type="text" placeholder="Drop a comment..." className="bg-transparent text-xs w-full focus:outline-none text-slate-200 placeholder:text-slate-600 font-bold" value={commentText} onChange={(e) => setCommentText(e.target.value)} />
            <button type="submit" disabled={!commentText.trim()} className="text-primary font-black text-[10px] uppercase tracking-widest disabled:opacity-30 transition-all hover:scale-105">Post</button>
        </form>
      </div>
    </article>
  );
};

export default PostCard;

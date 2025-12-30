import React, { useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, ChevronRight, Bookmark, ShieldAlert, Flag } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationsProps {
    onNavigatePost?: (postId: string) => void;
    onNavigateProfile?: (userId: string) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ onNavigatePost, onNavigateProfile }) => {
  const { notifications, markNotificationsRead } = useApp();

  useEffect(() => {
    markNotificationsRead();
  }, []);

  const handleNotificationClick = (notif: any) => {
      if (notif.postId && onNavigatePost) {
          onNavigatePost(notif.postId);
      } else if (notif.userId && onNavigateProfile) {
          onNavigateProfile(notif.userId);
      }
  };

  return (
    <div className="max-w-xl mx-auto pt-6 px-4 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 text-white">Activity Feed</h2>
      
      <div className="space-y-3">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => handleNotificationClick(notif)}
            className={`flex items-center gap-4 p-4 bg-surface rounded-2xl border border-slate-800 hover:border-primary/30 transition-all cursor-pointer group ${!notif.read ? 'ring-1 ring-primary/20' : ''}`}
          >
            <div className="relative">
               <img src={notif.userAvatar} alt={notif.username} className="w-12 h-12 rounded-full object-cover" />
               <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 border border-slate-800 shadow-xl">
                 {notif.type === 'like' && <Heart size={12} className="text-red-500 fill-red-500" />}
                 {notif.type === 'comment' && <MessageCircle size={12} className="text-blue-400 fill-blue-400" />}
                 {notif.type === 'follow' && <UserPlus size={12} className="text-primary fill-primary" />}
                 {notif.type === 'save' && <Bookmark size={12} className="text-yellow-500 fill-yellow-500" />}
                 {notif.type === 'report' && <Flag size={12} className="text-red-600 fill-red-600" />}
               </div>
            </div>
            
            <div className="flex-1">
              <p className="text-sm">
                <span className="font-bold text-white mr-1">{notif.username}</span>
                <span className="text-slate-400">
                  {notif.type === 'like' && 'liked your drop.'}
                  {notif.type === 'comment' && 'commented: ' + notif.text}
                  {notif.type === 'follow' && 'started following you.'}
                  {notif.type === 'save' && 'looted your drop to their vault.'}
                  {notif.type === 'report' && 'reported a transmission error.'}
                </span>
              </p>
              <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-wider">
                {new Date(notif.timestamp).toLocaleDateString()}
              </p>
            </div>

            {notif.postImage ? (
              <img src={notif.postImage} alt="Post" className="w-12 h-12 rounded-lg object-cover ml-auto ring-1 ring-slate-700" />
            ) : (
                <ChevronRight size={18} className="text-slate-700 group-hover:text-primary transition-colors" />
            )}
          </div>
        ))}
        
        {notifications.length === 0 && (
             <div className="text-center py-20">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart size={32} className="text-slate-700" />
                </div>
                <h3 className="text-slate-300 font-bold">Quiet on the front...</h3>
                <p className="text-slate-500 text-sm mt-1">Share more drops to get noticed!</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;